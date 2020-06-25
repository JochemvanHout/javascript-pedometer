const FootStrikeDetector = function (options, callback) {

    // filter params
    const SAMPLE_RATE = 60;
    const CUTOFF = 3;
    const RC = 1.0 / (CUTOFF * 2 * 3.14);
    const dt = 1.0 / SAMPLE_RATE;
    const alpha = dt / (RC + dt);

    let Abuffer = [];
    let lastCadence = null;
    let Af = 0, Af_old = 0, Bf = 0, Bf_old = 0;

    function push(item) {
        Abuffer.unshift(item);
        if (Abuffer.length > 100) {
            Abuffer.pop();
        }
        let mean = Abuffer.reduce(function (acc, cur) {
            return acc + cur;
        }, 0) / Abuffer.length;
        let sd = Math.sqrt(Abuffer.reduce(function (acc, cur) {
            return acc + Math.pow(cur - mean, 2);
        }, 0) / (Abuffer.length));

        let SDBuffer = Abuffer.slice(0,20);
        let meanb = SDBuffer.reduce(function (acc, cur) {
            return acc + cur;
        }, 0) / Abuffer.length;
        let sdb = Math.sqrt(SDBuffer.reduce(function (acc, cur) {
            return acc + Math.pow(cur - meanb, 2);
        }, 0) / (SDBuffer.length));

        let tmp = Af;
        Af = Af_old + (alpha * (item - Af_old));
        Af_old = tmp;

        tmp = Bf;
        Bf = (Af + Af_old) / 2 - mean;
        Bf_old = tmp;

        if (Bf_old >= 0 && Bf < 0 && sd > 2) {
            callback();
        }

        return [Bf, mean, sdb/sd];
    }

    function reset() {
        Abuffer = [];
    }

    return {
        push: push,
        reset: reset
    }
};