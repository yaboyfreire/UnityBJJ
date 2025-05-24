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

async function calcularPresencasMensaisPorFaixa() {
  const snapshot = await getDocs(collection(db, "StudentPresence"));
  const presencas = {};
  const todosMeses = new Set();

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const dataTimestamp = data.Data.toDate();
    const mes = `${dataTimestamp.getFullYear()}-${(dataTimestamp.getMonth() + 1).toString().padStart(2, '0')}`;
    todosMeses.add(mes);

    const studentRef = data.student;
    const studentSnap = await getDoc(studentRef);
    if (!studentSnap.exists()) continue;

    const faixa = studentSnap.data().faixa || "Sem Faixa";
    if (!presencas[faixa]) presencas[faixa] = {};
    if (!presencas[faixa][mes]) presencas[faixa][mes] = 0;

    presencas[faixa][mes]++;
  }

  const mesesOrdenados = Array.from(todosMeses).sort();

  const colorMap = {
    "White": 'rgb(255, 255, 255)',
    "Blue": 'rgba(0, 123, 255, 0.6)',
    "Purple": 'rgba(128, 0, 128, 0.6)',
    "Brown": 'rgba(139, 69, 19, 0.6)',
    "Black": 'rgb(0, 0, 0)',
    "Sem Faixa": 'rgba(192, 192, 192, 0.6)'
  };

  const datasets = Object.keys(presencas).map(faixa => ({
    label: faixa,
    data: mesesOrdenados.map(mes => presencas[faixa][mes] || 0),
    backgroundColor: colorMap[faixa] || 'rgba(100,100,100,0.6)',
    borderColor: faixa === "White" ? 'black' : undefined,  // Add black border for white bars
    borderWidth: faixa === "White" ? 1 : 0
  }));

  return { mesesOrdenados, datasets };
}

calcularMediaAulasPorFaixa().then(mediaPorFaixa => {
  console.log("Média mensal de presenças por faixa:");
  console.table(mediaPorFaixa);
});

calcularPresencasMensaisPorFaixa().then(({ mesesOrdenados, datasets }) => {
  Chart.register(ChartDataLabels);

  const ctx = document.getElementById('histogramaFaixas').getContext('2d');

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: mesesOrdenados,
      datasets: datasets
    },
    options: {
      responsive: true,
      plugins: {
        datalabels: {
          color: 'white',
          anchor: 'end',
          align: 'top',
          formatter: value => value > 0 ? value : ''
        },
        title: {
          display: true,
          text: 'Presenças por Mês e Faixa',
          color: 'white'
        },
        legend: {
          labels: {
            color: 'white'
          }
        }
      },
      scales: {
        x: {
          ticks: { color: 'white' },
          title: {
            display: true,
            text: 'Mês',
            color: 'white',

          }
        },
        y: {
          beginAtZero: true,
          ticks: { color: 'white' },
          title: {
            display: true,
            text: 'Número de Presenças',
            color: 'white'
          }
        }
      }
    }
  });
});