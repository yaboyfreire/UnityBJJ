// Firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAvXmhq6Gj75Jbuxqph4rJGmlLz6axXIoc",
  authDomain: "unitybjj-254ce.firebaseapp.com",
  projectId: "unitybjj-254ce",
  storageBucket: "unitybjj-254ce.firebasestorage.app",
  //storageBucket: "unitybjj-254ce.firebasestorage.app",
  messagingSenderId: "120660951337",
  appId: "1:120660951337:web:25bf767fadf75dcb5d3738",
  measurementId: "G-6ZL2SRMBD5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

// Function to fetch data from Firestore
async function fetchData(collectionName) {
  const collectionRef = collection(db, collectionName);
  try {
    const querySnapshot = await getDocs(collectionRef);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting documents: ", error);
    return [];
  }
}

// Exported function to show competitions
export async function showCompetitions() {
  try {
    const competitions = await fetchData("Competition");
    const competitionsList = document.getElementById('competitions-list');
  
    competitions.forEach(competition => {
      const competitionItem = document.createElement('div');
      competitionItem.textContent = `ID: ${competition.id} - Name: ${competition.Title} - Date: ${competition.date}`;
      competitionsList.appendChild(competitionItem);
    });
  } catch (error) {
    console.error('Error fetching competitions:', error.message);
  }
}


