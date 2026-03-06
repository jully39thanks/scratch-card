document.addEventListener("DOMContentLoaded", () => {
    // UI Elements
    const stepShare = document.getElementById("step-share");
    const stepScratch = document.getElementById("step-scratch");
    const btnShare = document.getElementById("btn-share");
    const btnRestart = document.getElementById("btn-restart");
    
    const resultTitle = document.getElementById("result-title");
    const resultImage = document.getElementById("result-image");
    const resultDesc = document.getElementById("result-desc");
    const resultArea = document.getElementById("result-area");
    const instructionP = document.querySelector(".instruction");
    
    // Canvas Elements
    const canvas = document.getElementById("scratch-canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    
    // Config
    const SCRATCH_THRESHOLD = 50; // percentage
    let isDrawing = false;
    let isRevealed = false;
    
    // Mock Variables
    const prizes = [
        {
            name: "1等：HIGE賞",
            image: "1_hige.png", // ← ここを自分で用意した画像のファイル名に変更してください
            desc: "おめでとう！",
            isWin: true
        },
                {
            name: "2等：竜ケ崎賞",
            image: "2_naaga.png", // ← ここを自分で用意した画像のファイル名に変更してください
            desc: "邪竜眼！",
            isWin: true
        },
                },
                {
            name: "3等：朱雀院賞",
            image: "3_ranma.png", // ← ここを自分で用意した画像のファイル名に変更してください
            desc: "ヴォロ・エルゴ・スム",
            isWin: true
        },
                },
                {
            name: "4等：巳須田賞",
            image: "4_misuta.png", // ← ここを自分で用意した画像のファイル名に変更してください
            desc: "ハートブレイク！",
            isWin: true
        },
        {
            name: "アナアキー賞",
            image: "sonohoka_anaakey.png", // ← ここを自分で用意した画像のファイル名に変更してください
            desc: "来店でステッカープレゼント！",
            isWin: false
        }
    ];

    // Initialize the canvas coating
    function initCanvas() {
        ctx.globalCompositeOperation = "source-over";
        
        // Draw metallic coating
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, "#ccc");
        gradient.addColorStop(0.5, "#fff");
        gradient.addColorStop(1, "#999");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add some noise/texture (simple mock pattern)
        ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
        for(let i=0; i<100; i++){
            ctx.beginPath();
            ctx.arc(
                Math.random() * canvas.width, 
                Math.random() * canvas.height, 
                Math.random() * 5, 
                0, Math.PI * 2
            );
            ctx.fill();
        }
        
        // Add text over canvas
        ctx.fillStyle = "#333";
        ctx.font = "bold 24px 'Orbitron', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("SCRATCH HERE", canvas.width/2, canvas.height/2);
        
        // Reset state
        canvas.classList.remove("fade-out");
        isRevealed = false;
        instructionP.style.display = "block";
        btnRestart.classList.add("hidden");
    }

    // Determine the prize based on the 33% win rate rule (1 in 3 chance for 8th prize)
    function rollPrize() {
        const rand = Math.random();
        const selected = (rand < 0.33) ? prizes[0] : prizes[1]; // 33% chance Anubis, 67% chance Anarchy
        
        resultTitle.textContent = selected.name;
        resultImage.src = selected.image;
        resultDesc.textContent = selected.desc;
        
        if (selected.isWin) {
            resultArea.classList.remove("loss");
        } else {
            resultArea.classList.add("loss");
        }
    }

    // Scratching logic
    function getPointerPos(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }

    function scratch(e) {
        if (!isDrawing || isRevealed) return;
        e.preventDefault();
        
        const pos = getPointerPos(e);
        
        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 30, 0, Math.PI * 2);
        ctx.fill();
        
        checkReveal();
    }

    // Check if scratched area exceeds threshold
    function checkReveal() {
        // Optimize: check every N frames or just do simple random sampling if performance is an issue.
        // For a 300x400 canvas, getImageData is fast enough.
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        let clearPixels = 0;
        const totalPixels = pixels.length / 4;
        
        // jump by 16 (stride) for performance
        for(let i = 3; i < pixels.length; i += 16) {
            if (pixels[i] === 0) {
                clearPixels++;
            }
        }
        
        const percent = (clearPixels / (totalPixels / 4)) * 100;
        
        if (percent > SCRATCH_THRESHOLD) {
            revealPrize();
        }
    }

    function revealPrize() {
        if (isRevealed) return;
        isRevealed = true;
        canvas.classList.add("fade-out"); // CSS transition handles the rest
        instructionP.style.display = "none";
        
        // Show restart button for the mockup evaluation
        setTimeout(() => {
            btnRestart.classList.remove("hidden");
        }, 1000);
    }

    // Event Listeners for Canva
    canvas.addEventListener("mousedown", (e) => { isDrawing = true; scratch(e); });
    canvas.addEventListener("mousemove", scratch);
    canvas.addEventListener("mouseup", () => isDrawing = false);
    canvas.addEventListener("mouseleave", () => isDrawing = false);

    canvas.addEventListener("touchstart", (e) => { isDrawing = true; scratch(e); });
    canvas.addEventListener("touchmove", scratch);
    canvas.addEventListener("touchend", () => isDrawing = false);
    canvas.addEventListener("touchcancel", () => isDrawing = false);

    // Share Button Logic
    btnShare.addEventListener("click", () => {
        // Mock X Share Intent
        const text = encodeURIComponent("スクラッチカードに挑戦！結果は...？");
        const url = encodeURIComponent(window.location.href);
        const shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        
        window.open(shareUrl, "_blank", "width=600,height=400");
        
        // Automatically unlock scratch card after clicking share for mockup purposes
        setTimeout(() => {
            stepShare.classList.remove("active");
            stepScratch.classList.add("active");
            rollPrize();
            initCanvas();
        }, 1000);
    });

    // Restart Button Logic
    btnRestart.addEventListener("click", () => {
        rollPrize();
        initCanvas();
    });

});
