// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getMessaging,onMessage } from 'firebase/messaging';

// Firebase 설정 객체 (콘솔에서 복사한 내용)
const firebaseConfig = {
    apiKey: "AIzaSyBCHjGjYjeHJ_BfnYr6971MNAmLmedWKa8",
    authDomain: "early-table-6315a.firebaseapp.com",
    projectId: "early-table-6315a",
    storageBucket: "early-table-6315a.firebasestorage.app",
    messagingSenderId: "531693985268",
    appId: "1:531693985268:web:404dd20c73d5d90e416da1",
    measurementId: "G-2K9VLFMZK3"
};

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);

// Firebase Cloud Messaging 초기화
const messaging = getMessaging(app);

onMessage(messaging, (message) => {
    console.log("FCM 메시지 수신:", message);  // 메시지가 제대로 수신되는지 확인
  });

export { messaging };
