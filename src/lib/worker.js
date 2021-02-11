self.onmessage = function(event) {
    console.log(`in web worker data = ${event.data}`);
    setInterval(async () => {
        const memUsed = await process.getProcessMemoryInfo();
        self.postMessage(memUsed);
    },1000)
}