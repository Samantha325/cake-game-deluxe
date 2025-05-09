$(document).ready(function() {
    const ingredients = [
        { name: '麵粉', image: 'https://cdn-icons-png.flaticon.com/512/2497/2497677.png' },
        { name: '雞蛋', image: 'https://cdn-icons-png.flaticon.com/512/837/837560.png' },
        { name: '牛奶', image: 'https://cdn-icons-png.flaticon.com/512/2674/2674486.png' },
        { name: '糖', image: 'https://cdn-icons-png.flaticon.com/512/3081/3181431.png' },
        { name: '奶油', image: 'https://cdn-icons-png.flaticon.com/512/2215/2215059.png' },
        { name: '香草精', image: 'https://cdn-icons-png.flaticon.com/512/3082/3082002.png' }
    ];

    const recipe = ['麵粉', '雞蛋', '牛奶', '糖', '奶油', '香草精'];
    const cakeStages = [
        'https://cdn-icons-png.flaticon.com/512/992/992771.png',      // 初始
        'https://cdn-icons-png.flaticon.com/512/3132/3132693.png',    // 33%
        'https://cdn-icons-png.flaticon.com/512/3132/3132927.png',    // 66%
        'https://cdn-icons-png.flaticon.com/512/3132/3132999.png'     // 完成
    ];

    let currentStep = 0;
    let score = 0;
    let streak = 0;
    let isPlaying = false;
    let highScore = localStorage.getItem('cakeGameHighScore') || 0;

    function playSound(type) {
        const audio = new Audio();
        switch(type) {
            case 'correct':
                audio.src = 'https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3';
                break;
            case 'wrong':
                audio.src = 'https://assets.mixkit.co/active_storage/sfx/2020/2020-preview.mp3';
                break;
            case 'complete':
                audio.src = 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3';
                break;
        }
        audio.play().catch(() => {}); // 忽略瀏覽器可能的自動播放限制
    }

    function updateProgress() {
        const progress = Math.floor((currentStep / recipe.length) * 100);
        $('#progress').text(progress);
        $('#progressBar').css('width', progress + '%');
        
        const stageIndex = Math.min(Math.floor(progress / 34), 3);
        $('#cakeImage').attr('src', cakeStages[stageIndex]);
        
        const statusMessages = [
            '準備開始製作...',
            '正在混合麵糊...',
            '蛋糕即將完成...',
            '蛋糕烤好了！'
        ];
        $('#cakeStatus').text(statusMessages[stageIndex]).addClass('pop');
        setTimeout(() => $('#cakeStatus').removeClass('pop'), 300);
    }

    function createIngredientGrid() {
        const grid = $('#gameGrid');
        grid.empty();
        
        const shuffledIngredients = [...ingredients].sort(() => Math.random() - 0.5);
        
        shuffledIngredients.forEach((ingredient, index) => {
            const cell = $('<div class="ingredient"></div>');
            cell.append(`<img src="${ingredient.image}" alt="${ingredient.name}" data-name="${ingredient.name}">`);
            cell.append(`<span class="shortcut">${index + 1}</span>`);
            grid.append(cell);
        });
    }

    function updateCurrentIngredient() {
        if (currentStep < recipe.length) {
            $('#currentIngredient').text(recipe[currentStep]);
            updateProgress();
        } else {
            endGame(true);
        }
    }

    function startGame() {
        isPlaying = true;
        currentStep = 0;
        score = 0;
        streak = 0;
        updateScoreDisplay();
        $('#sparkle').removeClass('active');
        createIngredientGrid();
        updateCurrentIngredient();
        $('#startGame').text('重新開始');
        $('#progressBar').css('width', '0%');
        
        // 添加開始動畫
        $('.game-container').addClass('game-start');
        setTimeout(() => $('.game-container').removeClass('game-start'), 500);
    }

    function updateScoreDisplay() {
        $('#score').text(score);
        $('#streak').text(streak);
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('cakeGameHighScore', highScore);
        }
    }

    function endGame(completed) {
        isPlaying = false;
        if (completed) {
            $('#sparkle').addClass('active');
            playSound('complete');
            alert(`太棒了！你完成了美味的蛋糕！\n最終得分：${score}\n最高連擊：${streak}\n歷史最高分：${highScore}`);
        } else {
            alert(`遊戲結束！\n最終得分：${score}\n最高連擊：${streak}\n歷史最高分：${highScore}`);
        }
        $('#currentIngredient').text('等待開始...');
    }

    // 事件監聽
    $('#startGame').on('click', startGame);

    $(document).on('click', '.ingredient', function() {
        if (!isPlaying) return;

        const clickedIngredient = $(this).find('img').data('name');
        $(this).addClass('pop');
        setTimeout(() => $(this).removeClass('pop'), 300);
        
        if (clickedIngredient === recipe[currentStep]) {
            playSound('correct');
            streak++;
            score += 10 * (streak >= 3 ? 2 : 1); // 連擊獎勵
            updateScoreDisplay();
            currentStep++;
            updateCurrentIngredient();
            createIngredientGrid();
            
            // 添加視覺特效
            $(this).addClass('correct');
            setTimeout(() => $(this).removeClass('correct'), 500);
        } else {
            playSound('wrong');
            streak = 0;
            score -= 5;
            updateScoreDisplay();
            $(this).addClass('wrong');
            setTimeout(() => $(this).removeClass('wrong'), 500);
            if (score < 0) {
                endGame(false);
            }
        }
    });

    // 添加鍵盤支援
    $(document).on('keydown', function(e) {
        if (!isPlaying) return;
        
        // 數字鍵 1-6 對應食材
        const keyIndex = e.key >= '1' && e.key <= '6' ? parseInt(e.key) - 1 : -1;
        if (keyIndex >= 0 && keyIndex < 6) {
            $('.ingredient').eq(keyIndex).click();
        }
    });

    // 添加遊戲說明
    $('<div class="help-tooltip">按數字鍵 1-6 可以快速選擇食材</div>').appendTo('body');
});
