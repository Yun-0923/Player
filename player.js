var audio = document.getElementById("audio");
var controlBtn = document.getElementById("controlBtn");
var play = controlBtn.children[0];
var mute = controlBtn.children[6];
var info = document.getElementById("info");
var progress = document.getElementById("progress");
var volControl = document.getElementById("volControl");
var volumeRange = volControl.children[0];
var getProgressBarID;
var getFunctionID;
var book = document.getElementById("book");
var myMusicList = book.children[0];
var bookTarget = book.children[1];
//一開始就要執行的 (初始設定的function)
getVolumeBar(); //設定初始音量
getProgressBar(); //設定初始撥放進度
InitSongPool(); //設定初始化音樂池

//更新音樂池
function updateMusicPool() {
    //清空音樂池
    for (var i = songPool.children.length - 1; i >= 0; i--) {
        songPool.remove(i);
    }

    //讀取bookTarget裡的歌給音樂池
    for (var i = 0; i < bookTarget.children.length; i++) {
        var option = document.createElement("option");

        option.value = bookTarget.children[i].title;
        option.innerText = bookTarget.children[i].innerText;

        songPool.appendChild(option);
    }
    changeSong(0);
}

// drag & drop 的功能區
function allowDrop(ev) {
    ev.preventDefault();  //放棄物件預設行為，改執行自己寫的function
}

function drag(ev) {
    ev.dataTransfer.setData("a", ev.target.id);  //抓取正在拖曳的物件
}

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("a");

    if (ev.target.id == "")
        ev.target.appendChild(document.getElementById(data));
    else
        ev.target.parentNode.appendChild(document.getElementById(data));
}

//初始化音樂池，一開始就把放在div(source)中全部放進下拉式選單的option中
function InitSongPool() {
    for (i = 0; i < myMusicList.children.length; i++) {
        var option = document.createElement("option");
        myMusicList.children[i].id = "song" + (i + 1);
        myMusicList.children[i].draggable = "true";
        myMusicList.children[i].ondragstart = drag;

        option.value = myMusicList.children[i].title;
        option.innerText = myMusicList.children[i].innerText;
        songPool.appendChild(option);
    }
    changeSong(0);
}

//顯示我的歌本
function showMusicList() {
    book.style.display = book.style.display == "flex" ? "none" : "flex";
}

//啟動隨機、單曲、全部循環的播放狀態
function setFuncBtnState() {
    for (var i = 7; i < controlBtn.children.length; i++) {
        controlBtn.children[i].className = "";
    }
    event.target.className = info.children[1].innerText != event.target.title ? "btnBColor" : "";
    info.children[1].innerText = info.children[1].innerText != event.target.title ? event.target.title : "正常";
}

//撥放器的預設播放行為應該是循序播放
function setPlayState() {
    if (audio.currentTime == audio.duration) {
        if (info.children[1].innerText == "全曲循環") {
            changeSong(1);
        } else if (info.children[1].innerText == "隨機撥放") {
            var r = Math.floor(Math.random() * songPool.children.length);
            r -= songPool.selectedIndex;
            changeSong(r);
        } else if (info.children[1].innerText == "單曲循環") {
            audio.currentTime = 0;
            playMusic();
        } else if (songPool.selectedIndex == songPool.children.length - 1) {
            stopMusic();
        }
        else
            changeSong(1);
    }
}
function changeSong(n) {
    var i = (songPool.selectedIndex + songPool.children.length + n) % songPool.children.length;
    audio.src = songPool.children[i].value;
    audio.title = songPool.children[i].innerText;
    songPool.children[i].selected = true;

    if (play.innerText == ";") {
        audio.onloadeddata = playMusic();
    }
}
//設定播放進度
function setProgress() {
    audio.currentTime = progress.value * audio.duration / progress.max;
    progress.style.backgroundImage = `-webkit-linear-gradient(left,rgb(145, 39, 21) ${progress.value / progress.max * 100}%,rgb(161, 176, 187) ${progress.value / progress.max * 100}%)`;
}
function getProgressBar() {
    progress.value = audio.currentTime / audio.duration * progress.max;
    progress.style.backgroundImage = `-webkit-linear-gradient(left,rgb(145, 39, 21) ${progress.value / progress.max * 100}%,rgb(161, 176, 187) ${progress.value / progress.max * 100}%)`;
    getProgressBarID = setTimeout(getProgressBar, 100);
}
//用按鈕設定音量
function setVolume(v) {
    volumeRange.value = parseInt(volumeRange.value) + v;
    getVolumeBar()
}
//用拖曳方式調整音量
function getVolumeBar() {
    audio.volume = parseInt(volumeRange.value) / 100;
    volControl.children[3].value = volumeRange.value
    volumeRange.style.backgroundImage = `-webkit-linear-gradient(left, rgb(41, 89, 152) ${volumeRange.value}%, rgb(150, 193, 226) ${volumeRange.value}%)`;
    mute.innerText = volControl.children[3].value == 0 ? "r" : "V";
}
//靜音
function muteMusic() {
    audio.muted = true;
    mute.innerText = "r";
    mute.onclick = unmuteMusic;
}
//取消靜音
function unmuteMusic() {
    audio.muted = false;
    mute.innerText = "V";
    mute.onclick = muteMusic;
}
//撥放音樂
function playMusic() {
    audio.play();
    play.innerText = ";";
    play.onclick = pauseMusic;
    info.children[0].innerText = `歌曲：${audio.title}`;

    getProgressBar();
    getFunctionID = setInterval(function () {
        getTime();
        setPlayState();
    }, 700);
}
//暫停音樂
function pauseMusic() {
    audio.pause();
    play.innerText = "4";
    play.onclick = playMusic;
    clearTimeout(getProgressBarID);
    info.children[0].innerText = "音樂暫停";
}
//停止音樂撥放
function stopMusic() {
    pauseMusic();
    audio.currentTime = 0;
    getProgressBar();
    clearTimeout(getProgressBarID);
    info.children[0].innerText = "音樂停止";
}
//倒轉及快轉
function changeTime(t) {
    audio.currentTime += t;
}
//取得撥放時間
function getTimeFormat(t) {
    var m = parseInt(t / 60);
    var s = parseInt(t % 60);
    s = s < 10 ? "0" + s : s;
    return m + ":" + s;
}
function getTime() {
    info.children[2].innerText = getTimeFormat(audio.currentTime) + "/" + getTimeFormat(audio.duration);
}