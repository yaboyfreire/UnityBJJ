document.addEventListener('DOMContentLoaded', function () {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    if (isLoggedIn) {
        // Basic profile fields
        const name = localStorage.getItem('name') || 'Bruce Wayne';
        const nationality = 'Portuguese'; // Static or load from localStorage if added

        // Get studentData
        const studentDataRaw = localStorage.getItem('studentData');
        let memberSince = 'N/A';
        let age = 'N/A'; // Still not available unless you store DOB
        let faixa = 'Unknown';

        if (studentDataRaw) {
    try {
        const studentData = JSON.parse(studentDataRaw);

        // Member since (start_date.seconds to year)
        const startDate = studentData.start_date?.seconds
            ? new Date(studentData.start_date.seconds * 1000)
            : null;
        memberSince = startDate ? startDate.getFullYear() : 'N/A';

        // Belt (faixa)
        faixa = studentData.faixa || 'Unknown';

        // Age (birth_date.seconds to age)
        const birthTimestamp = studentData.birth_date?.seconds;
        if (birthTimestamp) {
            const birthDate = new Date(birthTimestamp * 1000);
            const today = new Date();
            age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
        }

    } catch (e) {
        console.error('Error parsing studentData:', e);
    }
}


        // Update profile info in DOM
        document.querySelector('.profile-info h1').textContent = name;
        document.querySelector('.profile-info p:nth-child(2)').textContent = `Nationality: ${nationality}`;
        document.querySelector('.profile-info p:nth-child(3)').textContent = `Member since ${memberSince}`;
        document.querySelector('.profile-info p:nth-child(4)').textContent = `Age: ${age}`;

        // Update leaderboard name
        document.querySelectorAll('.leader-card, .ranking-card').forEach(card => {
            const leaderName = card.querySelector('.leader-name, h4');
            if (leaderName && leaderName.textContent.includes('Bruce Wayne')) {
                leaderName.textContent = name;
            }
        });

        // Replace profile image if provided
        const profileImg = localStorage.getItem('profileImg');
        if (profileImg) {
            document.querySelectorAll('img.profile-img, .ranking-img').forEach(img => {
                if (img.src.includes('images 2.png')) {
                    img.src = profileImg;
                }
            });
        }

        // === New belt switch-case logic ===
        const beltColor = faixa.toLowerCase(); // e.g., "white"
        let beltNumber;

        switch (beltColor) {
            case 'white':
                beltNumber = 1;
                break;
            case 'blue':
                beltNumber = 2;
                break;
            case 'purple':
                beltNumber = 3;
                break;
            case 'brown':
                beltNumber = 4;
                break;
            case 'black':
                beltNumber = 5;
                break;
            default:
                beltNumber = 0; // Unknown or no belt
        }

        document.querySelectorAll('.belt').forEach(beltEl => {
            beltEl.classList.add(`belt-${beltNumber}`);
        });
    }
});
