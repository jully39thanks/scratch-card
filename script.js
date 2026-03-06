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
    
    // Prize List (修正済み)
    const prizes = [
        {
            name: "1等：HIGE賞",
            image: "1_hige.png",
            desc: "おめでとう！",
            isWin: true
        },
        {
            name: "2等：竜ケ崎賞",
            image: "2_naaga.png",
            desc: "邪竜眼！",
            isWin: true
        }, // ← ここにあった余分な } を削除
        {
            name: "3等：朱雀院賞",
            image: "3_ranma.png",
            desc: "ヴォロ・エルゴ・スム",
            isWin: true
        }, // ← ここにあった余分な } を削除
        {
            name: "4等：巳須田賞",
            image: "4_misuta.png",
            desc: "ハートブレイク！",
            isWin: true
        },
        {
            name: "アナアキー賞",
            image: "sonohoka_anaakey.png",
            desc: "来店でステッカープレゼント！",
            isWin: false
        }
    ];

    function initCanvas() {
        ctx.globalCompositeOperation = "source-over";
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, "#ccc");
        gradient.addColorStop(0.5, "#fff");
        gradient.addColorStop(1, "#999");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
        for(let i=0; i<100; i++){
            ctx.beginPath();
            ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 5, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.fillStyle = "#333";
        ctx.font = "bold 24px 'Orbitron', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("SCRATCH HERE", canvas.width/2, canvas.height/2);
        
        canvas.classList.remove("fade-out");
        isRevealed = false;
        instructionP.style.display = "block";
        btnRestart.classList.add("hidden");
    }

    function rollPrize() {
        // 全ての賞からランダムに選ぶ（例：単純な等確率）
        const randomIndex = Math.floor(Math.random() * prizes.length);
        const selected = prizes[randomIndex];
        
        resultTitle.textContent = selected.name;
        resultImage.src = selected.image;
        resultDesc.textContent = selected.desc;
        
        if (selected.isWin) {
            resultArea.classList.remove("loss");
        } else {
            resultArea.classList.add("loss");
        }
    }

    function getPointerPos(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
    }

    function scratch(e) {
        if (!isDrawing || isRevealed) return;
        if (e.cancelable) e.preventDefault();
        
        const pos = getPointerPos(e);
        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 30, 0, Math.PI * 2);
        ctx.fill();
        checkReveal();
    }

    function checkReveal() {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        let clearPixels = 0;
        for(let i = 3; i < pixels.length; i += 16) {
            if (pixels[i] === 0) clearPixels++;
        }
        const percent = (clearPixels / (pixels.length / 64)) * 100;
        if (percent > SCRATCH_THRESHOLD) revealPrize();
    }

    function revealPrize() {
        if (isRevealed) return;
        isRevealed = true;
        canvas.classList.add("fade-out");
        instructionP.style.display = "none";
        setTimeout(() => {
            btnRestart.classList.remove("hidden");
        }, 1000);
    }

    canvas.addEventListener("mousedown", (e) => { isDrawing = true; scratch(e); });
    window.addEventListener("mousemove", scratch); // 画面外に外れてもいいようにwindowに変更
    window.addEventListener("mouseup", () => isDrawing = false);

    canvas.addEventListener("touchstart", (e) => { isDrawing = true; scratch(e); });
    canvas.addEventListener("touchmove", scratch);
    canvas.addEventListener("touchend", () => isDrawing = false);

    btnShare.addEventListener("click", () => {
        const text = encodeURIComponent("スクラッチカードに挑戦！結果は...？");
        const url = encodeURIComponent(window.location.href);
        const shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        window.open(shareUrl, "_blank", "width=600,height=400");
        
        setTimeout(() => {
            stepShare.classList.remove("active");
            stepScratch.classList.add("active");
            rollPrize();
            initCanvas();
        }, 1000);
    });

    btnRestart.addEventListener("click", () => {
        rollPrize();
        initCanvas();
    });
});