document.addEventListener('DOMContentLoaded', function () {
    const classes = document.querySelectorAll('.class');
    const days = document.querySelectorAll('.day');
    const timeSlots = document.querySelectorAll('.time-slot');

    // Track join counts and user state
    const joinCounts = {};
    const joinedClasses = new Set(); // store joined class IDs
    const maxJoins = 20;
    let currentClassId = null;

    window.handleJoin = function () {
        if (!currentClassId) return;

        const isJoined = joinedClasses.has(currentClassId);
        const currentCount = joinCounts[currentClassId] || 0;

        if (isJoined) {
            // User leaves the class
            joinCounts[currentClassId] = Math.max(0, currentCount - 1);
            joinedClasses.delete(currentClassId);
        } else {
            // User joins the class
            if (currentCount >= maxJoins) return;
            joinCounts[currentClassId] = currentCount + 1;
            joinedClasses.add(currentClassId);
        }

        updateJoinButton(currentClassId);
    }

    function updateJoinButton(classId) {
        const button = document.getElementById('joinBtn');
        const text = document.getElementById('joinCountText');
        const count = joinCounts[classId] || 0;
        const isJoined = joinedClasses.has(classId);

        text.textContent = `${count}/${maxJoins} pessoas inscritas`;

        if (count >= maxJoins && !isJoined) {
            button.disabled = true;
            button.textContent = 'Completo';
            button.style.backgroundColor = '#ccc';
            button.style.cursor = 'not-allowed';
        } else {
            button.disabled = false;
            button.textContent = isJoined ? 'Leave' : 'Join';
            button.style.backgroundColor = isJoined ? '#f44336' : '#4CAF50';
            button.style.color = '#fff';
            button.style.cursor = 'pointer';
        }
    }

    classes.forEach(classElement => {
        classElement.addEventListener('click', function () {
            const gridColumn = parseInt(this.style.gridColumn);
            const gridRowValue = this.style.gridRow;

            const dayName = days[gridColumn - 1]?.textContent || 'Dia desconhecido';

            let startRow, endRow;

            if (gridRowValue.includes('/')) {
                const parts = gridRowValue.split('/').map(part => part.trim());
                startRow = parseInt(parts[0]);

                if (parts[1].includes('span')) {
                    const span = parseInt(parts[1].replace('span', '').trim());
                    endRow = startRow + span - 1;
                } else {
                    endRow = parseInt(parts[1]);
                }
            } else {
                startRow = endRow = parseInt(gridRowValue);
            }

            const startTime = timeSlots[startRow - 1]?.textContent.split('-')[0].trim();
            const endTime = timeSlots[endRow - 1]?.textContent.split('-')[1].trim();
            const timeText = `${startTime}-${endTime}`;

            const className = this.textContent.trim();
            const description = this.getAttribute('data-description') || 'Sem descrição disponível';

            currentClassId = `${className}-${dayName}-${timeText}`;

            openModal(className, timeText, dayName, description);
            updateJoinButton(currentClassId);
        });
    });

    document.querySelector('.close').addEventListener('click', closeModal);
});

function openModal(title, time, day, description) {
    const modal = document.getElementById("classModal");
    document.getElementById("modal-title").textContent = title;
    document.getElementById("modal-time").textContent = time;
    document.getElementById("modal-day").textContent = day;
    document.getElementById("modal-description").textContent = description;
    modal.style.display = "block";

    document.body.style.overflow = "hidden";
}

function closeModal() {
    document.getElementById("classModal").style.display = "none";
    document.body.style.overflow = "auto";
}

window.addEventListener('click', function (event) {
    const modal = document.getElementById("classModal");
    if (event.target === modal) {
        closeModal();
    }
});

window.addEventListener('keydown', function (event) {
    if (event.key === "Escape") {
        closeModal();
    }
});
