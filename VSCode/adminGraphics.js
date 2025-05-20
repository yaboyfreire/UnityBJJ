import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAvXmhq6Gj75Jbuxqph4rJGmlLz6axXIoc",
  authDomain: "unitybjj-254ce.firebaseapp.com",
  projectId: "unitybjj-254ce",
  storageBucket: "unitybjj-254ce.appspot.com",
  messagingSenderId: "120660951337",
  appId: "1:120660951337:web:25bf767fadf75dcb5d3738"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function calcularMediaAulasPorFaixa() {
  const snapshot = await getDocs(collection(db, "StudentPresence"));
  const faixaMensal = {};

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const dataTimestamp = data.Data.toDate();
    const mes = `${dataTimestamp.getFullYear()}-${(dataTimestamp.getMonth() + 1).toString().padStart(2, '0')}`;

    const studentRef = data.student;
    const studentSnap = await getDoc(studentRef);
    if (!studentSnap.exists()) continue;

    const faixa = studentSnap.data().faixa || "Sem Faixa";

    if (!faixaMensal[faixa]) faixaMensal[faixa] = {};
    if (!faixaMensal[faixa][mes]) faixaMensal[faixa][mes] = 0;

    faixaMensal[faixa][mes]++;
  }

  const mediaPorFaixa = {};
  for (const faixa in faixaMensal) {
    const meses = Object.values(faixaMensal[faixa]);
    const total = meses.reduce((sum, qtd) => sum + qtd, 0);
    mediaPorFaixa[faixa] = (total / meses.length).toFixed(2);
  }

  return mediaPorFaixa;
}

calcularMediaAulasPorFaixa().then((mediaPorFaixa) => {
  const ctx = document.getElementById('histogramaFaixas').getContext('2d');

  const colorMap = {
  "White": 'rgb(255, 255, 255)',
  "Blue": 'rgba(0, 123, 255, 0.6)',
  "Purple": 'rgba(128, 0, 128, 0.6)',
  "Brown": 'rgba(139, 69, 19, 0.6)',
  "Black": 'rgb(0, 0, 0)',
  "Sem Faixa": 'rgba(192, 192, 192, 0.6)'
};

const borderColorMap = {
  "White": 'rgb(0, 0, 0)',
  "Blue": 'rgba(0, 123, 255, 1)',
  "Purple": 'rgba(128, 0, 128, 1)',
  "Brown": 'rgba(139, 69, 19, 1)',
  "Black": 'rgba(0, 0, 0, 1)',
  "Sem Faixa": 'rgba(192, 192, 192, 1)'
};

const labels = Object.keys(mediaPorFaixa);
  new Chart(ctx, {
  type: 'bar',
  data: {
    labels,
    datasets: [{
      label: 'Média Mensal de Aulas por Faixa',
      data: Object.values(mediaPorFaixa),
      backgroundColor: labels.map(faixa => colorMap[faixa] || 'rgba(100,100,100,0.6)'),
      borderColor: labels.map(faixa => borderColorMap[faixa] || 'rgba(100,100,100,1)'),
      borderWidth: 1
    }]
  },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: 'white'
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Aulas (média mensal)',
            color: 'white'
          },
          ticks: { color: 'white' }
        },
        x: {
          title: {
            display: true,
            text: 'Faixa',
            color: 'white'
          },
          ticks: { color: 'white' }
        }
      }
    }
  });
});
