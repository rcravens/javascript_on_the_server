const purr_sound = document.getElementById('purr');

const imgs = document.querySelectorAll('img');
imgs.forEach((el) => {

    let total_distance = 0;
    let last_x = null;
    let last_y = null;
    const PET_THRESHOLD = 1000; // pixels moved to trigger purr
    let has_purred = false;

    function on_mouse_move(e) {
        if (last_x !== null && last_y !== null) {
            const dx = e.clientX - last_x;
            const dy = e.clientY - last_y;
            total_distance += Math.sqrt(dx * dx + dy * dy);

            if (total_distance >= PET_THRESHOLD && !has_purred) {
                has_purred = true;
                purr_sound.currentTime = 0;
                purr_sound.play();
            }
        }
        last_x = e.clientX;
        last_y = e.clientY;
    }

    function on_mouse_leave() {
        total_distance = 0;
        last_x = null;
        last_y = null;
        has_purred = false;
        purr_sound.pause();
        purr_sound.currentTime = 0;
    }

    el.addEventListener('mouseenter', () => {
        total_distance = 0;
        last_x = null;
        last_y = null;
        has_purred = false;
        el.addEventListener('mousemove', on_mouse_move);
        el.addEventListener('mouseleave', on_mouse_leave);
    });
});