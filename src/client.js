var remoteUsers = {};

var rtc = {
    localAudioTrack: null,
    localVideoTrack: null,
};

const options = {
    appId: "f69320a113714fbf8acd1c8340bba1eb",
    channel: "VitaleCallMed",
  token: '007eJxTYPDLiMiTeGDCzVjz1OICx4dZVzQCeS+t50rLmCsomibvvkGBIc3M0tjIINHQ0Njc0CQtKc0iMTnFMNnC2MQgKSnRMDXpQ45BWkMgIwPbrfvMjAwQCOLzMoRlliTmpDon5uT4pqYwMAAAf2EgTA==',
    uid: "1"
    // hora da criacao : 140703791029056
};

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });



/*
function fetchToken(uid, channelName, tokenRole) {

    return new Promise(function (resolve) {
        axios.post('https://agora-token-api.herokuapp.com/rtctoken', {
            uid: uid,
            channelName: channelName,
            role: tokenRole
        }, {
            headers: {
                'Content-Type': 'application/json; charset=UTF-8'
            }
        })
            .then(function (response) {
                const token = response.data.token;
                resolve(token);
            })
            .catch(function (error) {
                console.log(error);
            });
    })
}
*/
async function startBasicCall() {
    client.on("user-published", handleUserPublished);
    client.on("user-unpublished", handleUserUnpublished);

    options.uid = Math.floor(100000*Math.random(Date.now()));
  //  options.token= await fetchToken(options.uid, options.channel, 1);

    await client.join(options.appId, options.channel, options.token, options.uid);
    rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    rtc.localVideoTrack = await AgoraRTC.createCameraVideoTrack();

    const localPlayerContainer = document.createElement("div");
    localPlayerContainer.textContent = "ME-" + options.uid.toString();
    localPlayerContainer.id = options.uid;
    localPlayerContainer.className = "video-container";
    localPlayerContainer.style.width = "640px";
    localPlayerContainer.style.height = "480px";
     // localPlayerContainer.style.width = "320px";
    //localPlayerContainer.style.height = "240px";
    document.getElementById('video-grid').appendChild(localPlayerContainer);
    rtc.localVideoTrack.play(localPlayerContainer);


    await client.publish([rtc.localAudioTrack, rtc.localVideoTrack]);
    console.log("publish success!");
}

async function leave() {
    for (trackName in rtc) {
        var track = rtc[trackName];
        if(track) {
            track.stop();
            track.close();
            rtc[trackName] = undefined;
        }
    }
    // Remove remote users and player views.
    remoteUsers = {};

    // leave the channel
    await client.leave();
    console.log("client leaves channel success");
}

async function subscribe(user, mediaType) {
    const uid = user.uid;
    // subscribe to a remote user
    await client.subscribe(user, mediaType);
    console.log("subscribe success");

    if (mediaType === 'video') {
        const remoteVideoTrack = user.videoTrack;
        const remotePlayerContainer = document.createElement("div");
        remotePlayerContainer.textContent = "USER-" + uid.toString();
        remotePlayerContainer.id = uid;
        remotePlayerContainer.className = "video-container";
        remotePlayerContainer.style.width = "320px";
        remotePlayerContainer.style.height = "240px";
        document.getElementById('video-grid').appendChild(remotePlayerContainer);
        remoteVideoTrack.play(remotePlayerContainer);
            // user.audioTrack.play();
    }
    if (mediaType === 'audio') {
      user.audioTrack.play();
    }
}

function handleUserPublished(user, mediaType) {
    const id = user.uid;
    remoteUsers[id] = user;
    subscribe(user, mediaType);
}

function handleUserUnpublished(user) {
    const id = user.uid;
    delete remoteUsers[id];
    document.getElementById(id).remove();
}

startBasicCall();