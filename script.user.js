// ==UserScript==
// @name         Coinflip Spoofer
// @namespace    https://github.com/xNasuni
// @version      2024-02-01
// @description  spoofs coinflip probabilities
// @author       Mia
// @match        https://www.google.com/search*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @version      1.2
// @downloadURL  https://github.com/xNasuni/google-coin-flip-spoofer/raw/main/script.user.js
// @updateURL    https://github.com/xNasuni/google-coin-flip-spoofer/raw/main/script.user.js
// @supportURL   https://github.com/xNasuni/google-coin-flip-spoofer/issues
// @grant        none
// ==/UserScript==

// this runs on any google search page but it shouldnt mess with anything. PLEASE REPORT A ISSUE IF SOMETHING DOES OCCUR

(async () => {
    // incase anyone editing the array uses [t, h] etc.. 😭
    var t = 't'; // idiot-proof
    var h = 'h'; // idiot-proof
    var tails = 't'; // idiot-proof
    var heads = 'h'; // idiot-proof

    // EDIT ONLY THIS PART BELOW
    var sequence = `t, t, t, t, t, t, t`; // the SEQUENCE in which the 'randomness' will play out, after it's DONE going through all of them, it'll be back to NORMAL 'randomness'. (you are free to change this ARRAY)
    // EDIT ONLY THIS PART ABOVE

    var _internalSequence = sequence.replaceAll(" ", "").split(",")

    var sequenceIndex = 0 // do not change THIS or ANYTHING below this line unless yk what ur doing
    var inSequenceIndex = 0 // 0 - 5 since internal random coin flip selector thing calls Math.random 5 times 😭
    var byteMap = {
        'h': 0,
        't': 1,
        'heads': 0,
        'tails': 0,
        '0': 0,
        '1': 1
    } // utility

    const nothing = {
        intercepted: false,
        return: null
    }

    function getCaller(level) {
      const stack = new Error().stack;
      const stackLines = stack.split('\n');
      return stackLines[level].trim()
    }

    function signatureMatch(level) {
        const caller = getCaller(level)
        console.log(caller)
        // at ksz.flip (https://www.google.com/xjs/_/js/<...truncated...>?xjs=s3:25:135)
        return caller.includes("ksz.flip")
    }

    function hookfunction(container, funcName, hookCallback) {
        const old = container[funcName]

        function _internalHook() {
            var data = hookCallback(old, arguments)
            if (data.intercepted) {
              return data.return
            }
            return old()
        }
            console.log("Set", container, funcName, "to", _internalHook)

        container[funcName] = _internalHook;
    }

    function handleRandomHook(old, arguments) {
        // Math.random can be called from other sources, so i added a simple 'integrity' check.
        // the code below was commented out bc i hardcoded it above since for some reason ReturnData.IsReturning isn't reliable
        //if (!MatchesSignature(HookCaller)) {
        //  return nothing;
        //}

        // iterate through fake 'random' sequence UNLESS we are OUT OF RANGE of user-set sequence
        // the code below was commented out bc i hardcoded it above since for some reason ReturnData.IsReturning isn't reliable
        //if ((SequenceIndex) >= Sequence.length) {
        //  return nothing // return normal Math.random stuff and doesn't apply hook
        //}

        // we are in stage 0-5 on index 0 to length of user-set sequence
        // we want to only increase sequence index on the first stage, so we'll increase it every 5
        // this could be very unstable but i will check it thoroughly and if it's okay then
        // we'll roll with it :)

        if (!signatureMatch(5) || sequenceIndex >= _internalSequence.length) { // will not hook Math.random if it's not being called from what looks like the heads/tails chooser, and also will not spoof if we are out of the range of the user-set sequence.
          return nothing
        }

        var hookResponse = nothing

        var finalOutcome = _internalSequence[sequenceIndex]

        //console.log(FinalOutcome, InSequenceIndex, SequenceIndex)-->used for debugging purposes during development

        hookResponse.intercepted = true // kinda useless now that i hardcoded my hook thing but it was just being weird so
        hookResponse.return = byteMap[finalOutcome]

        if (inSequenceIndex > 0) { // 'ISI' is 0 rn, if it's greater than that we should just return real random things.
            hookResponse.intercepted = false; // if we already did the first Math.random call which is the one that's the guess, we should make everything after random like the coin velocity.
        }

        inSequenceIndex += 1;

        if (inSequenceIndex >= 5) {
            inSequenceIndex = 0
            sequenceIndex += 1
        }

        return hookResponse;
    }

    hookfunction(Math, 'random', handleRandomHook)
})()
