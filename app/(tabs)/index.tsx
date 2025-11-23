import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';

const API_URL = "https://alcovia-backend-8npl.onrender.com"; 

export default function HomeScreen() {
  const [currentScreen, setCurrentScreen] = useState("login");
  const [studentId, setStudentId] = useState(""); 
  const [data, setData] = useState({ status: "Loading...", history: [] });
  const [score, setScore] = useState('');
  const [focus, setFocus] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let interval;
    if (currentScreen === "dashboard" && studentId) {
        fetchData();
        interval = setInterval(fetchData, 2000);
    }
    return () => clearInterval(interval);
  }, [currentScreen, studentId]);

  const fetchData = () => {
    fetch(`${API_URL}/student/${studentId}`)
    .then(res => res.json())
    .then(resData => {
        if(resData.status) setData(resData);
    })
    .catch(err => console.log("Connecting..."));
  };

  const handleLogin = () => {
      if(studentId.trim().length < 1) {
          alert("Please enter a valid ID");
          return;
      }
      setCurrentScreen("dashboard");
  };

  const handleLogout = () => {
      setStudentId("");
      setScore("");
      setFocus("");
      setData({ status: "Loading...", history: [] });
      setCurrentScreen("login");
  };

  const submitData = async () => {
    if(!score || !focus) return alert("Please fill both score and focus time!");
    setLoading(true);
    try {
        await fetch(`${API_URL}/daily-checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: studentId, quiz_score: parseInt(score), focus_minutes: parseInt(focus) })
        });
        alert("Data Saved! ✅");
    } catch(e) { alert("Error saving data"); }
    setLoading(false);
    setScore(''); setFocus('');
  };

  const unlockApp = async () => {
    await fetch(`${API_URL}/mark-complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: studentId })
    });
    alert("Unlocked! 🎉");
  };

  // --- SCREEN 1: LOGIN ---
  if (currentScreen === "login") {
      return (
        <View style={styles.loginContainer}>
            <View style={styles.loginCard}>
                <Text style={{fontSize: 50, marginBottom: 10}}>🎓</Text>
                <Text style={styles.loginTitle}>Student Portal</Text>
                <Text style={{color:'gray', marginBottom: 20}}>Enter your ID to continue</Text>
                
                <TextInput 
                    style={styles.input} 
                    placeholder="Enter Student ID (e.g., 123)" 
                    value={studentId} 
                    onChangeText={setStudentId}
                />
                
                <TouchableOpacity style={styles.btnLogin} onPress={handleLogin}>
                    <Text style={styles.btnText}>Login ➔</Text>
                </TouchableOpacity>
            </View>
        </View>
      );
  }

  // --- SCREEN 2: LOCKED ---
  if (data.status === "Needs Intervention") {
    return (
      <View style={[styles.container, {backgroundColor: '#FFEBEE'}]}>
        <View style={styles.cardLocked}>
          <Text style={{fontSize: 60}}>🚫</Text>
          <Text style={styles.lockedTitle}>ACCESS DENIED</Text>
          <Text style={styles.lockedSub}>Student ID: {studentId}</Text>
          <Text style={styles.lockedSub}>Performance Low. Mentor Notified.</Text>
          
          <ActivityIndicator size="large" color="#D32F2F" style={{marginVertical: 20}}/>
          
          <TouchableOpacity style={styles.btnUnlock} onPress={unlockApp}>
            <Text style={styles.btnText}>🔓 Admin Unlock</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handleLogout} style={{marginTop: 30}}>
            <Text style={{color: 'blue', fontWeight:'bold'}}>⬅ Log Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // --- SCREEN 3: DASHBOARD ---
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.headerRow}>
          <Text style={styles.appName}>Hi, Student {studentId} 👋</Text>
          <TouchableOpacity onPress={handleLogout} style={styles.btnLogout}>
              <Text style={{color:'white', fontSize:12}}>Logout</Text>
          </TouchableOpacity>
      </View>

      <View style={[styles.statusBadge, {backgroundColor: '#E8F5E9', alignSelf:'center', marginBottom: 20}]}>
            <Text style={{color: '#2E7D32', fontWeight: 'bold'}}>Current Status: {data.status || "Checking..."}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Daily Check-in 📝</Text>
        
        <View style={{flexDirection:'row', justifyContent:'space-between'}}>
            <View style={{width: '48%'}}>
                <Text style={styles.label}>Quiz (0-10)</Text>
                <TextInput 
                    style={styles.input} 
                    placeholder="8" 
                    value={score} 
                    onChangeText={setScore} 
                    keyboardType="numeric"
                />
            </View>
            <View style={{width: '48%'}}>
                <Text style={styles.label}>Focus (Mins)</Text>
                <TextInput 
                    style={styles.input} 
                    placeholder="60" 
                    value={focus} 
                    onChangeText={setFocus} 
                    keyboardType="numeric"
                />
            </View>
        </View>

        <TouchableOpacity style={styles.btnPrimary} onPress={submitData} disabled={loading}>
          <Text style={styles.btnText}>{loading ? "Saving..." : "Submit Report"}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Your History 🕒</Text>
      {data.history && data.history.map((log, index) => (
        <View key={index} style={styles.historyItem}>
          <Text style={styles.historyText}>🎯 Score: <Text style={{fontWeight:'bold'}}>{log.quiz_score}</Text></Text>
          <Text style={styles.historyText}>⏱️ Focus: <Text style={{fontWeight:'bold'}}>{log.focus_minutes}m</Text></Text>
        </View>
      ))}
      
      {(!data.history || data.history.length === 0) && (
          <Text style={{textAlign:'center', color:'gray', marginTop: 20}}>No history found yet.</Text>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loginContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F2F5' },
  loginCard: { backgroundColor: 'white', padding: 40, borderRadius: 20, width: '90%', maxWidth: 400, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, elevation: 5 },
  loginTitle: { fontSize: 26, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  btnLogin: { backgroundColor: '#2563EB', padding: 15, borderRadius: 10, width: '100%', alignItems: 'center', marginTop: 10 },
  scrollContainer: { padding: 20, backgroundColor: '#F5F7FA', minHeight: '100%' },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  appName: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  btnLogout: { backgroundColor: '#FF5252', paddingVertical: 5, paddingHorizontal: 15, borderRadius: 20 },
  statusBadge: { paddingHorizontal: 15, paddingVertical: 5, borderRadius: 20 },
  card: { backgroundColor: 'white', borderRadius: 15, padding: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5, marginBottom: 20 },
  cardLocked: { backgroundColor: 'white', borderRadius: 20, padding: 40, alignItems: 'center', shadowColor: '#D32F2F', shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 },
  lockedTitle: { fontSize: 28, fontWeight: 'bold', color: '#D32F2F', marginTop: 10 },
  lockedSub: { textAlign: 'center', color: '#666', marginTop: 10, fontSize: 16 },
  btnUnlock: { backgroundColor: '#D32F2F', padding: 15, borderRadius: 10, alignItems: 'center', width: '100%' },
  cardTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#444' },
  label: { fontSize: 14, color: '#666', marginBottom: 5, fontWeight: '600' },
  input: { backgroundColor: '#F0F2F5', borderRadius: 10, padding: 15, marginBottom: 15, fontSize: 16, width:'100%' },
  btnPrimary: { backgroundColor: '#2563EB', padding: 15, borderRadius: 10, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#555', marginBottom: 10, marginLeft: 5 },
  historyItem: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#2563EB' },
  historyText: { fontSize: 14, color: '#444' }
});