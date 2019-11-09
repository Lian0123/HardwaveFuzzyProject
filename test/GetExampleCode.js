module.exports = {
    'Get Only Fuzzy Control Code': function (browser) {
      browser
        .url('file:///home/lian/git/HardwaveFuzzyProject/index.html')
        .waitForElementVisible('body', 1000)
        .click('button[type="button"]')
        .waitForElementVisible('body')
        .waitForElementVisible('body', 1000)
        /*
        .assert.titleContains('Ecosia')
        .assert.visible('input[type=search]')
        .setValue('input[type=search]', 'nightwatch')
        .assert.visible('button[type=submit]')
        .click('button[type=submit]')
        .assert.containsText('.mainline-results', 'Nightwatch.js')
        .end();*/
    }
};

/*
module.exports = {
    'Get Have NN Fuzzy Control Code': function (browser) {
    }
};
*/