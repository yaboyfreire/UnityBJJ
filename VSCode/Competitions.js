import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAvXmhq6Gj75Jbuxqph4rJGmlLz6axXIoc",
  authDomain: "unitybjj-254ce.firebaseapp.com",
  projectId: "unitybjj-254ce",
  storageBucket: "unitybjj-254ce.appspot.com",
  messagingSenderId: "120660951337",
  appId: "1:120660951337:web:25bf767fadf75dcb5d3738"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Load and render competitions
export async function loadCompetitions() {
  try {
    const competitionsRef = collection(db, "Competition");
    const querySnapshot = await getDocs(competitionsRef);

    const gridContainer = document.querySelector(".grid-container");
    if (!gridContainer) {
      console.error("Grid container element not found.");
      return;
    }

    gridContainer.innerHTML = ""; // Clear previous content

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();

      const date = data.Date?.toDate().toLocaleDateString("en-GB", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });

      const title = data.Title || "Untitled";
      const location = data.Local || "Unknown location";
      const imageUrl = data.link || "./Images/default-competition.jpg"; // Use custom image if available

      const cardHTML = `
        <a href="GenericCompetitionInfo.html?id=${docSnap.id}" class="competition-card-link">
          <div class="competition-card">
            <div class="banner-image">
              <img src="${imageUrl}" alt="${title} Banner" onerror="this.src='./Images/default-competition.jpg';">
            </div>
            <div class="competition-info">
              <h3 class="comp-title">${title}</h3>
              <p class="comp-location">${location}</p>
              <p class="comp-date">${date || "No date available"}</p>
            </div>
          </div>
        </a>
      `;

      gridContainer.innerHTML += cardHTML;
    });

  } catch (error) {
    console.error("Error loading competitions:", error);
  }
}

loadCompetitions();
