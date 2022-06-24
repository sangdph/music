const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio   = $('#audio')


var cd = $('.cd')
var playButton = $('.btn-toggle-play');
var player = $('.player');
var progress = $('#progress');
var nextButton = $('.btn-next');
var previousButton = $('.btn-prev');
var randomButton = $('.btn-random');
var repeatButton = $('.btn-repeat');
var playlist = $('.playlist');

var PLAYER_STORAGE_KEY = "Sangdph";


const media = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'Sáng mắt chưa?',
            singer: "Trúc Nhân",
            path: './mp3/sang-mat-chua.mp3',
            image: './img/sang-mat-chua.jpg'
        },{
            name: 'Có không giữ mất đừng tìm?',
            singer: "Trúc Nhân",
            path: './mp3/co-khong-giu-mat-dung-tim.mp3',
            image: './img/co-khong-giu-mat-dung-tim.jpg'
        },
        {
            name: 'Stereo Hearts (feat. Adam Levine)',
            singer: "Gym Class Heroes",
            path: './mp3/stereo-hearts.mp3',
            image: './img/stereo-hearts.jpg' 
        },
        {
            name: 'Sunday',
            singer: "Sia",
            path: './mp3/sunday.mp3',
            image: './img/sunday.jpg'
        }
        
    ],
    setConfig: function(key, value){
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    render: function(){
        const htmls = this.songs.map((song, index) =>{
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                <div class="thumb" style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
            `
        })
        playlist.innerHTML = htmls.join('');
    },
    defineProperties: function(){
        Object.defineProperty(this, 'currentSong', {
            get: function(){
                return this.songs[this.currentIndex];
            }
        })
    },
    handleEvents: function()
    {
        var cdWidth = cd.offsetWidth;
        var thisPrev = this;

        //Xử lý CD quay / dừng
        var  cdThumbRotate= cdThumb.animate([
            { transform: 'rotate(360deg)'}
        ], {
            duration: 10000, //thời gian quay 1 vòng
            iterations: Infinity //số lần lặp vô hạn
        })
        cdThumbRotate.pause();


        //Xử lý scale Thumbnail
        document.onscroll = function(){
            const posScroll = window.scrollY || document.documentElement.scrollTop;
            const scrollWidth = cdWidth - posScroll;

            cd.style.width = scrollWidth > 0 ? scrollWidth + 'px' : 0;
            cd.style.opacity = scrollWidth / cdWidth;
        }

        //Xử lý click playlist
        playButton.onclick = function(){
            if(thisPrev.isPlaying){
                audio.pause();
            }
            else{   
                audio.play();
            }
        }

        audio.onplay = function(){
            thisPrev.isPlaying = true;
            player.classList.add('playing');
            cdThumbRotate.play();
        }

        audio.onpause = function(){
            thisPrev.isPlaying = false;
            player.classList.remove('playing');
            cdThumbRotate.pause();
        }

        audio.ontimeupdate = function(){
            if(audio.duration){
                var percentProgress = Math.floor(audio.currentTime / audio.duration * 100);
                progress.value = percentProgress;
            }
        }

        progress.onchange = function(e){
            var seekTime = audio.duration / 100 * e.target.value;
            audio.currentTime = seekTime;
        }

        nextButton.onclick = function(){
            thisPrev.isRandom == true ? thisPrev.randomSong() : thisPrev.nextSong();
            audio.play();
            thisPrev.render();
            thisPrev.currentIndex == 0 ? thisPrev.scrollToActiveSongPre() : thisPrev.scrollToActiveSong();
        }

        previousButton.onclick = function(){
            thisPrev.isRandom == true ? thisPrev.randomSong() : thisPrev.previousSong();
            audio.play();
            thisPrev.render();
            thisPrev.scrollToActiveSongPre();
        }

        randomButton.onclick = function(e){
            thisPrev.isRandom = !thisPrev.isRandom;
            thisPrev.setConfig('isRandom', thisPrev.isRandom);
            randomButton.classList.toggle('active', thisPrev.isRandom);
        }

        repeatButton.onclick = function(e){
            thisPrev.isRepeat = !thisPrev.isRepeat;
            thisPrev.setConfig('isRepeat', thisPrev.isRepeat);
            repeatButton.classList.toggle('active', thisPrev.isRepeat);
        }
        
        audio.onended = function(){
            if(thisPrev.isRepeat){
                audio.play();
            }
            else{
                nextButton.click();
            }
        }

        playlist.onclick = function(e){
            var songElement = e.target.closest('.song:not(.active)');
            if(songElement || e.target.closest('.option')){
               if(songElement){
                   thisPrev.currentIndex = Number(songElement.getAttribute('data-index'));
                   thisPrev.loadCurrentSong();
                   thisPrev.render();
                   audio.play();
               }
            }

        }
    },
    scrollToActiveSong: function(){
        setTimeout(()=>{
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            }, 400)
        })
    },
    scrollToActiveSongPre: function(){
        setTimeout(()=>{
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            }, 400)
        })
    },
    loadCurrentSong(){
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },
    loadConfig(){
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },
    nextSong: function(){
        this.currentIndex++;
        if(this.currentIndex >= this.songs.length){
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
    previousSong: function(){
        this.currentIndex--;
        if(this.currentIndex < 0){
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },
    randomSong: function(){
        let newCurrent;
        do{
            newCurrent = Math.floor(Math.random() * this.songs.length);
        }while(newCurrent === this.currentIndex);

        this.currentIndex = newCurrent;
        this.loadCurrentSong();
    },
    start: function(){
        this.loadConfig();
        this.defineProperties();
        this.handleEvents();
        this.loadCurrentSong();
        this.render();
        repeatButton.classList.toggle('active', this.isRepeat);
        randomButton.classList.toggle('active', this.isRandom);
    }


}
media.start();

