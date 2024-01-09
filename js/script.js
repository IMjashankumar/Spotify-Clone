console.log("how are you");
let currentSong = new Audio();
let songs;
let currfolder;

// seconds to minutes conversion 
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return `00:00`;
    }


    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const minutesString = String(minutes).padStart(2, '0');
    const secondsString = String(remainingSeconds).padStart(2, '0');

    return `${minutesString}:${secondsString}`;
}

async function getSongs(folder) {
    currfolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
    let response = await a.text();
    // console.log(response);
    let div = document.createElement("div");
    div.innerHTML = response;
    let sngs = div.getElementsByTagName("a");
    songs = [];
    for (let i = 0; i < sngs.length; i++) {
        const element = sngs[i];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    // Show all the songs in the playlist 
    let songUl = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUl.innerHTML = "";
    for (const song of songs) {
        songUl.innerHTML = songUl.innerHTML + `<li>
        <img class="invert music" src="img/Music.png" alt="">
        <div class="info">
            <div>${song.replaceAll("%20", " ")}</div>
            <div>Jashan Kumar</div>
        </div>
        <div class="playNow">
            <span class="pnow">Play Now</span>
            <span><img src="svg files/play_circle.svg" class="invert small-symbols play_circle" alt=""></span>
        </div>
        </li>`;

    }


    // Attach an event listner to each Song 
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());

        })
    })

    return songs;
}

const playMusic = (track, pause = false) => {
    // let audio = new Audio("/songs/" + track);
    // audio.play();
    currentSong.src = `/${currfolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "svg files/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00/00:00";
}

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:5500/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    // console.log(response);
    let cardContainer = document.querySelector(".cardContainer");
    let anchors = div.getElementsByTagName("a");
    let array = (Array.from(anchors));
    // console.log(e.href);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").slice(-1)[0];
            // Get the metadata of the folder 
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
            let response = await a.json();
            console.log(response);
            cardContainer.innerHTML = cardContainer.innerHTML +
                `<div data-folder="${folder}" class="card">
            <span id="previous" class="material-symbols-outlined play">play_arrow</span>
            <img src="songs/${folder}/cover.jpg" alt="">
            <h3>${response.title}</h3>
            <p>${response.description}</p>
        </div>`
        }
    }

    // console.log(anchors);

    // Load the playlist whenever card is clicked 
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);
        })
    })

}

async function main() {



    // Songs list 
    await getSongs("songs/Korala_Maan");
    playMusic(songs[0], true)

    // Display all the albums on the page 
    displayAlbums();


    // Attach an event listner to previous, play and next 
    play.addEventListener("click", element => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "svg files/pause.svg";
        }
        else {
            currentSong.pause()
            play.src = "svg files/play.svg";
        }
    })


    // Listen for time update 
    currentSong.addEventListener("timeupdate", () => {
        // console.log(currentSong.currentTime,currentSong.duration);
        // console.log(`
        // ${secondsToMinutesSeconds(currentSong.currentTime)}:
        // ${secondsToMinutesSeconds(currentSong.duration)}`);

        document.querySelector(".songtime").innerHTML = `
        ${secondsToMinutesSeconds(currentSong.currentTime)} / 
        ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";

    })


    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })

    // Add an event listner for hamburger 
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = 0;
    })

    // Add an event listner for close 
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    })


    // Add an event listner for previous
    previousico.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);

        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        }
    })

    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);

        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        }
    })

    // Add an event listner for volume 
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
        if(currentSong.volume > 0){
            document.querySelector(".volume>img").src = document.querySelector(".volume > img").src.replace("mute.svg","volume.svg");
        }

    })

    // Add an event listner to mute the volume 
    document.querySelector(".volume img").addEventListener("click",e=>{
        console.log(e.target.src);
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg","mute.svg");
            currentSong.volume=0;
            document.querySelector(".range").getElementsByTagName("input")[0].value=0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg","volume.svg");
            currentSong.volume=0.1;
            document.querySelector(".range").getElementsByTagName("input")[0].value=10;
        }
        
    })

    // audio.addEventListener("loadeddata",() => {
    //     let duration = audio.duration;
    //     console.log(duration);
    // })
}

main();
