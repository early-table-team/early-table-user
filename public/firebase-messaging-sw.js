// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js");
importScripts(
  "https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js"
);

//잘돌아가던코드 절대 지우지말기//
// // Firebase Messaging 인스턴스 가져오기
// const firebaseApp = firebase.initializeApp({
//     apiKey: "AIzaSyBCHjGjYjeHJ_BfnYr6971MNAmLmedWKa8",
//     authDomain: "early-table-6315a.firebaseapp.com",
//     projectId: "early-table-6315a",
//     storageBucket: "early-table-6315a.firebasestorage.app",
//     messagingSenderId: "531693985268",
//     appId: "1:531693985268:web:404dd20c73d5d90e416da1",
//     measurementId: "G-2K9VLFMZK3"
// });
//
// // Retrieve an instance of Firebase Messaging so that it can handle background
// // messages.
// const messaging = firebaseApp.messaging();
//잘돌아가던코드 절대 지우지말기//

const firebaseConfig = {
  apiKey: "AIzaSyBCHjGjYjeHJ_BfnYr6971MNAmLmedWKa8",
  authDomain: "early-table-6315a.firebaseapp.com",
  projectId: "early-table-6315a",
  storageBucket: "early-table-6315a.firebasestorage.app",
  messagingSenderId: "531693985268",
  appId: "1:531693985268:web:404dd20c73d5d90e416da1",
  measurementId: "G-2K9VLFMZK3",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// 백그라운드 메시지 수신
messaging.onBackgroundMessage((payload) => {
  console.log("백그라운드 메시지 수신:", payload);
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: payload.notification.icon,
  });
});
