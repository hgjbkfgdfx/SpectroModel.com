/**
 * REAL-TIME ML AVATAR UPDATES
 * WebSocket connection to inference service for live avatar upgrades during training
 * NOTE: Requires separate Python inference service to be running
 */

import { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';

const BASE44_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ.-_~!*+?@#$%^";

// Base44 decoder
function base44Decode(str) {
  let num = 0n;
  const base = BigInt(BASE44_ALPHABET.length);
  
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const digit = BASE44_ALPHABET.indexOf(char);
    if (digit === -1) throw new Error(`Invalid Base44 character: ${char}`);
    num = num * base + BigInt(digit);
  }
  
  // Convert BigInt to byte array
  const hex = num.toString(16);
  const paddedHex = hex.length % 2 ? '0' + hex : hex;
  const bytes = new Uint8Array(paddedHex.length / 2);
  
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(paddedHex.substr(i * 2, 2), 16);
  }
  
  return bytes;
}

export function useRealtimeML({ onAvatarUpdate, onError, enabled = false }) {
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [latestUpdate, setLatestUpdate] = useState(null);
  const attemptCountRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 3;

  useEffect(() => {
    if (!enabled) {
      console.log('ℹ️ Real-time ML: Disabled (set enabled=true to activate)');
      return;
    }

    const connectWebSocket = () => {
      // Stop trying after max attempts
      if (attemptCountRef.current >= MAX_RECONNECT_ATTEMPTS) {
        console.warn('⚠️ Real-time ML: Max connection attempts reached. Service may not be running.');
        setConnectionStatus('unavailable');
        return;
      }

      try {
        // Replace with your inference service URL
        const wsUrl = 'ws://localhost:8000/ws/avatars'; // Update in production
        
        console.log(`🔌 Real-time ML: Connecting to inference service (attempt ${attemptCountRef.current + 1}/${MAX_RECONNECT_ATTEMPTS})...`);
        const ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
          console.log('✅ Real-time ML: Connected to inference service');
          setConnectionStatus('connected');
          attemptCountRef.current = 0; // Reset on successful connection
        };
        
        ws.onmessage = async (event) => {
          try {
            const payload = JSON.parse(event.data);
            console.log('📦 Real-time ML: Received update:', payload);
            
            // payload: { avatar_id, version, asset_b44, model_version }
            
            // Decode Base44 asset
            let imageUrl = null;
            if (payload.asset_b44) {
              try {
                const bytes = base44Decode(payload.asset_b44);
                const blob = new Blob([bytes], { type: 'image/png' });
                imageUrl = URL.createObjectURL(blob);
              } catch (decodeError) {
                console.error('Real-time ML: Base44 decode failed:', decodeError);
              }
            }
            
            const update = {
              avatarId: payload.avatar_id,
              version: payload.version,
              modelVersion: payload.model_version,
              imageUrl,
              timestamp: Date.now()
            };
            
            setLatestUpdate(update);
            
            if (onAvatarUpdate) {
              onAvatarUpdate(update);
            }
            
            // Record to ML learning system
            recordMLUpdate(update);
            
          } catch (err) {
            console.error('❌ Real-time ML: Failed to process update:', err.message);
            if (onError) onError(err);
          }
        };
        
        ws.onerror = (error) => {
          // Don't log full error object to avoid console spam
          console.warn('⚠️ Real-time ML: Connection error (inference service not running?)');
          setConnectionStatus('error');
          attemptCountRef.current++;
        };
        
        ws.onclose = () => {
          console.log('🔌 Real-time ML: Disconnected from inference service');
          setConnectionStatus('disconnected');
          wsRef.current = null;
          
          // Only attempt reconnect if we haven't exceeded max attempts
          if (attemptCountRef.current < MAX_RECONNECT_ATTEMPTS) {
            reconnectTimeoutRef.current = setTimeout(() => {
              console.log('🔄 Real-time ML: Attempting to reconnect...');
              connectWebSocket();
            }, 5000);
          } else {
            console.warn('⚠️ Real-time ML: Service unavailable. To enable, start the Python inference service.');
            setConnectionStatus('unavailable');
          }
        };
        
        wsRef.current = ws;
        
      } catch (err) {
        console.error('❌ Real-time ML: Connection failed:', err.message);
        setConnectionStatus('error');
        attemptCountRef.current++;
        if (onError) onError(err);
      }
    };
    
    connectWebSocket();
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
      attemptCountRef.current = 0;
    };
  }, [enabled, onAvatarUpdate, onError]);
  
  return {
    connectionStatus,
    latestUpdate,
    isConnected: connectionStatus === 'connected'
  };
}

// Record ML updates for learning
async function recordMLUpdate(update) {
  try {
    // Store interaction for ML learning
    if (typeof window !== 'undefined' && window.localStorage) {
      const mlData = JSON.parse(localStorage.getItem('ml_avatar_updates') || '[]');
      mlData.push({
        ...update,
        userEmail: (await base44.auth.me().catch(() => null))?.email,
        timestamp: Date.now()
      });
      
      // Keep last 1000 updates
      if (mlData.length > 1000) {
        mlData.shift();
      }
      
      localStorage.setItem('ml_avatar_updates', JSON.stringify(mlData));
    }
  } catch (err) {
    console.error('Failed to record ML update:', err);
  }
}

export default useRealtimeML;