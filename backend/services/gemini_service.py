import google.generativeai as genai
import json
import re
import logging
from flask import current_app

logger = logging.getLogger(__name__)

class GeminiAnomalyDetector:
    def __init__(self, api_key=None):
        self.api_key = api_key or current_app.config.get('GEMINI_API_KEY')
        
        # Check if key is dummy or missing
        is_dummy = not self.api_key or "your_" in self.api_key or "dummy" in self.api_key.lower()
        
        if self.api_key and not is_dummy:
            try:
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel('gemini-1.5-flash')
                logger.info("Gemini AI service successfully initialized.")
            except Exception as e:
                logger.error(f"Failed to configure Gemini: {e}")
                self.model = None
        else:
            self.model = None
            reason = "Missing key" if not self.api_key else "Dummy key detected"
            logger.warning(f"Gemini AI service using Rule-Based Fallback. Reason: {reason}")


    def _extract_json(self, response_text):
        """Robustly extracts JSON from AI response, even if wrapped in markdown."""
        try:
            # Try to find JSON block in markdown
            match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if match:
                return json.loads(match.group())
            return json.loads(response_text)
        except Exception as e:
            logger.error(f"Failed to parse Gemini JSON output: {e}")
            return None

    def analyze_sensor_reading(self, sensor_data: dict, batch_info: dict, historical_readings: list = None) -> dict:
        """Analyzes a single reading for anomalies using Gemini 1.5 Flash."""
        if not self.model:
            return self._rule_based_fallback(sensor_data)

        history_str = json.dumps(historical_readings if historical_readings else [], indent=2)
        
        prompt = f"""
        You are a pharmaceutical supply chain AI safety inspector.
        
        Analyze this drug shipment sensor reading and determine if there is an anomaly.
        
        Drug Batch: {batch_info.get('batch_id')}
        Drug Name: {batch_info.get('drug_name')}
        Manufacturer: {batch_info.get('manufacturer')}
        
        Current Sensor Reading:
        - Temperature: {sensor_data.get('temperature')}°C (Allowed: 2-8°C)
        - Humidity: {sensor_data.get('humidity')}% (Allowed: 60-75%)
        - Seal Status: {'Intact' if sensor_data.get('seal_intact') else 'BREACHED'}
        - Location: {sensor_data.get('latitude')}, {sensor_data.get('longitude')}
        - Timestamp: {sensor_data.get('timestamp')}
        
        Historical Context (last 5 readings):
        {history_str}
        
        Respond ONLY in this exact JSON format:
        {{
          "is_anomaly": true/false,
          "anomaly_score": 0.0-1.0,
          "anomaly_type": "TEMPERATURE_BREACH/HUMIDITY_BREACH/SEAL_BREACH/NONE",
          "severity": "LOW/MEDIUM/HIGH/CRITICAL",
          "root_cause": "brief explanation",
          "recommendation": "specific action to take",
          "risk_to_patients": "brief patient safety impact",
          "confidence": 0.0-1.0
        }}
        """

        try:
            response = self.model.generate_content(prompt)
            result = self._extract_json(response.text)
            
            if result:
                if result.get('is_anomaly'):
                    # Generate full report asynchronously or as part of result
                    result['full_report'] = self.generate_full_report(sensor_data, batch_info, result)
                    # Emit alert
                    from ..app import socketio
                    socketio.emit('gemini_alert', result)
                return result
            
            logger.warning("Gemini returned invalid format. Falling back to rules.")
            return self._rule_based_fallback(sensor_data)

        except Exception as e:
            logger.error(f"Gemini API call failed: {e}")
            return self._rule_based_fallback(sensor_data)

    def generate_full_report(self, sensor_data, batch_info, anomaly_result) -> str:
        """Generates a detailed human-readable alert report."""
        if not self.model:
            return "Manual Report Required: Gemini API offline."

        prompt = f"""
        Generate a detailed human-readable pharmaceutical safety alert report based on this anomaly:
        Context: {json.dumps({'sensor': sensor_data, 'batch': batch_info, 'anomaly': anomaly_result})}
        
        Include:
        1. Executive Summary
        2. Technical Analysis
        3. Patient Safety Risk Assessment
        4. Recommended Immediate Actions
        5. Regulatory Notification Requirements (referencing WHO/FDA standards)
        """
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception:
            return "Failed to generate AI report. Please inspect sensor logs immediately."

    def get_supply_chain_insights(self, batch_id, all_readings) -> str:
        """Analyzes full journey of a batch and provides strategic insights."""
        if not self.model:
            return "Insights unavailable: Gemini API offline."

        prompt = f"Analyze the full journey of drug batch {batch_id} and provide strategic supply chain insights including efficiency patterns and risk mitigation for future shipments: {json.dumps(all_readings)}"
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception:
            return "Error calculating supply chain insights."

    def chat_with_pharmachain(self, user_message: str, context: dict) -> str:
        """
        Conversational interface for supply chain stakeholders.
        Context includes batch info and recent sensor trends.
        """
        if not self.model:
            return "I'm sorry, my AI processing core is currently offline. Please contact technical support."

        system_prompt = f"""
        You are the PharmaChain AI Supply Chain Expert. 
        A user is asking you questions about their drug shipments.
        
        USE THIS CONTEXT TO ANSWER:
        {json.dumps(context, indent=2)}
        
        RULES:
        1. Be professional, concise, and safety-focused.
        2. If you see an anomaly in the context, emphasize the risk.
        3. If you don't have information about a specific batch in the context, ask for the Batch ID.
        4. Refer to blockchain proofs if they are present in the context.
        """
        
        try:
            chat = self.model.start_chat(history=[])
            response = chat.send_message(f"{system_prompt}\n\nUser Question: {user_message}")
            return response.text
        except Exception as e:
            logger.error(f"Chat simulation failed: {e}")
            return "I encountered a synchronization error while retrieving batch data. Please try again."

    def _rule_based_fallback(self, sensor_data):
        """Simple deterministic logic when AI is unavailable."""
        temp = sensor_data.get('temperature', 0)
        seal = sensor_data.get('seal_intact', True)
        
        is_anomaly = temp < 2.0 or temp > 8.0 or not seal
        
        return {
            "is_anomaly": is_anomaly,
            "anomaly_score": 1.0 if is_anomaly else 0.0,
            "anomaly_type": "TEMPERATURE_BREACH" if (temp < 2.0 or temp > 8.0) else ("SEAL_BREACH" if not seal else "NONE"),
            "severity": "HIGH" if is_anomaly else "NONE",
            "root_cause": "Environmental threshold exceeded (Rule-based fallback)",
            "recommendation": "Manual inspection of shipment required immediately.",
            "risk_to_patients": "Potential loss of drug efficacy if temperature range was exceeded for a prolonged period.",
            "confidence": 1.0
        }
