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

async function calcularMediaMensalAtualPorFaixa() {
  const snapshot = await getDocs(collection(db, "StudentPresence"));
  const presencasPorFaixa = {};
  const alunosUnicosPorFaixa = {};

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const dataTimestamp = data.Data.toDate();

    if (dataTimestamp.getFullYear() !== currentYear || dataTimestamp.getMonth() !== currentMonth) continue;

    const studentRef = data.student;
    const studentSnap = await getDoc(studentRef);
    if (!studentSnap.exists()) continue;

    const faixa = studentSnap.data().faixa || "Sem Faixa";
    const studentId = studentRef.id;

    if (!presencasPorFaixa[faixa]) {
      presencasPorFaixa[faixa] = 0;
      alunosUnicosPorFaixa[faixa] = new Set();
    }

    presencasPorFaixa[faixa]++;
    alunosUnicosPorFaixa[faixa].add(studentId);

  }

  const colorMap = {
    "White": 'rgb(255, 255, 255)',
    "Blue": 'rgba(0, 123, 255, 0.6)',
    "Purple": 'rgba(128, 0, 128, 0.6)',
    "Brown": 'rgba(139, 69, 19, 0.6)',
    "Black": 'rgb(0, 0, 0)',
    "Sem Faixa": 'rgba(192, 192, 192, 0.6)'
  };

  const faixas = Object.keys(presencasPorFaixa);
  const valores = faixas.map(faixa => {
    const totalPresencas = presencasPorFaixa[faixa];
    const totalAlunos = alunosUnicosPorFaixa[faixa].size || 1;
    return parseFloat((totalPresencas / totalAlunos).toFixed(2));
  });

  const datasets = [{
    data: valores,
    backgroundColor: faixas.map(faixa => colorMap[faixa] || 'rgba(100,100,100,0.6)'),
    borderColor: faixas.map(faixa => faixa === "White" ? 'black' : undefined),
    borderWidth: faixas.map(faixa => faixa === "White" ? 1 : 0),

  }];

  return { faixas, datasets };
}

calcularMediaMensalAtualPorFaixa().then(({ faixas, datasets }) => {
  Chart.register(ChartDataLabels);

  const ctx = document.getElementById('histogramaFaixas').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: faixas,
      datasets: datasets
    },
    options: {
      responsive: true,
      plugins: {
        datalabels: {
          color: 'black',         // label color
          anchor: 'end',
          align: 'top',

        
          font: {
            weight: 'bold',
            size: 14
          },
          formatter: function (value) {
            return value.toFixed(2);  // format label text
          }
        },
        title: {
          display: true,
          text: 'Média de Presenças - Mês Atual',
          color: 'white'
        },
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          ticks: { color: 'white' },
          title: {
            display: true,
            text: 'Faixa',
            color: 'white'
          }
        },
        y: {
          beginAtZero: true,
          ticks: { color: 'white' },
          title: {
            display: true,
            text: 'Média de Presenças',
            color: 'white'
          }
        }
      }
    }
  });
});

// GRÁFICO NÚMERO 2

async function calcularLucrosPorCategoria() {
  try {
    const snapshot = await getDocs(collection(db, "Payment"));
    const lucrosPorCategoria = {};
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    for (const doc of snapshot.docs) {
      const data = doc.data();

      if (!data.Profit || !data.PaymentDate || !data.PaymentType || !data.Amount) continue;

      const paymentDate = data.PaymentDate.toDate();
      if (paymentDate.getFullYear() !== currentYear || paymentDate.getMonth() !== currentMonth) continue;

      let categoryName = "Outros";
      try {
        const paymentTypeSnap = await getDoc(data.PaymentType);
        if (paymentTypeSnap.exists()) {
          console.log("PaymentType:", paymentTypeSnap.data()); // 👈 logs referenced document
          const name = paymentTypeSnap.data().type;
          if (typeof name === "string" && name.trim() !== "") {
            categoryName = name.trim();
          }
        }
      } catch (error) {
        console.warn("Erro ao obter tipo de pagamento:", error);
      }

      const amount = Number(data.Amount) || 0;
      if (amount > 0) {
        lucrosPorCategoria[categoryName] = (lucrosPorCategoria[categoryName] || 0) + amount;
      }
    }

    const result = Object.entries(lucrosPorCategoria)
      .filter(([label, value]) => value > 0 && label && label !== "undefined")
      .sort((a, b) => b[1] - a[1]);

    return {
      labels: result.map(([label]) => label),
      values: result.map(([_, value]) => value)
    };
  } catch (error) {
    console.error("Erro ao calcular lucros:", error);
    return { labels: [], values: [] };
  }
}

// Inicializar o gráfico após carregar os dados
calcularLucrosPorCategoria().then(({ labels, values }) => {
  const canvas = document.getElementById('graficoLucros');
  if (!canvas) {
    console.error("Elemento canvas não encontrado!");
    return;
  }

  if (labels.length === 0 || values.length === 0 || labels.length !== values.length) {
    canvas.style.display = 'none';
    const noDataMsg = document.createElement('p');
    noDataMsg.textContent = 'Nenhum dado de lucro disponível para o mês atual';
    noDataMsg.style.color = 'white';
    canvas.parentNode.insertBefore(noDataMsg, canvas.nextSibling);
    return;
  }

  new Chart(canvas, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: labels.map((_, i) =>
          [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)'
          ][i % 5]
        ),
        borderColor: 'rgba(255, 255, 255, 0.8)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        datalabels: {
          formatter: (value, context) => {
            const sum = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
            return sum > 0 ? `${(value * 100 / sum).toFixed(1)}%\n€${value.toFixed(2)}` : '';
          },
          color: '#fff',
          font: {
            weight: 'bold',
            size: 12
          }
        },
        legend: {
          position: 'right',
          labels: {
            color: 'white',
            font: {
              size: 12
            }
          }
        },
        title: {
          display: true,
        
          color: 'white',
          font: {
            size: 16
          }
        }
      }
    },
    plugins: [ChartDataLabels]
  });
});
