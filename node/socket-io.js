import { Server } from 'socket.io';
import moment from 'moment';

let io;

function initializeSocketIO(server) {
    io = new Server(server, {
        cors: {
            // origin: 'https://www.apkgreen.co.th/'
            origin: 'http://localhost',
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });

    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        socket.on('disconnect', () => {
            console.log(`Disconnect Server: ${moment().format('DD-MM-YYYY')}, ${moment().format('HH:mm:ss')}`);
        });
    });

    if (io) {
        console.log("Socket.IO initialized successfully.");
    } else {
        console.log("Failed to initialize Socket.IO.");
    }
}

function sendSumBoss(sumbossapr) {    
    console.log(`Sum Boss Approve Updated: ${JSON.stringify(sumbossapr)}`);    
    if (io) {
        io.emit('sumbossapr', sumbossapr);
    }
}

function sendSumStore(sumstore) {    
    console.log(`Sum Store Count Updated: ${JSON.stringify(sumstore)}`);    
    if (io) {
        io.emit('sumstore', sumstore);
    }
}

function sendSumBossApr(sumstoreviwe) {    
    console.log(`Sum Store Boss Approve Updated: ${JSON.stringify(sumstoreviwe)}`);    
    if (io) {
        io.emit('sumstoreviwe', sumstoreviwe);
    }
}

function sendSumBossAprMn(sumstoreviwemn) {    
    console.log(`Sum Store Boss ApproveMn Updated: ${JSON.stringify(sumstoreviwemn)}`);    
    if (io) {
        io.emit('sumstoreviwemn', sumstoreviwemn);
    }
}

export default {
    initializeSocketIO,
    sendSumBoss,
    sendSumStore,
    sendSumBossApr,
    sendSumBossAprMn
};