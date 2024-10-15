let GoogleAuth;

function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

function initClient() {
    gapi.client.init({
        'clientId': '596692033055-9v6j238h4nha17jrl38lq8k8188249vk.apps.googleusercontent.com', // Replace with your Google client ID
        'scope': 'https://www.googleapis.com/auth/youtube.readonly'
    }).then(function () {
        GoogleAuth = gapi.auth2.getAuthInstance();
        document.getElementById('login-btn').addEventListener('click', function () {
            GoogleAuth.signIn().then(fetchYouTubeStats);
        });
    });
}

function fetchYouTubeStats() {
    const user = GoogleAuth.currentUser.get();
    const accessToken = user.getAuthResponse().access_token;

    // Fetch YouTube stats via Vercel serverless function
    fetch(`/api/youtube-stats?accessToken=${accessToken}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('username').innerText = user.getBasicProfile().getName();
            document.getElementById('stats').style.display = 'block';

            document.getElementById('total-likes').innerText = data.likes;
            document.getElementById('subscribers').innerText = data.subscribers;
            document.getElementById('top-video').innerText = data.topVideo;
            document.getElementById('top-video-views').innerText = data.topVideoViews;

            const commentsList = document.getElementById('comments');
            commentsList.innerHTML = ''; // Clear the list
            data.comments.forEach(comment => {
                const li = document.createElement('li');
                li.innerText = comment;
                commentsList.appendChild(li);
            });
        })
        .catch(error => {
            console.error('Error fetching YouTube stats:', error);
        });
}

gapi.load('client:auth2', handleClientLoad);
