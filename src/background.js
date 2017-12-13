console.log('Load.');

chrome.runtime.onMessage.addListener((message, sender, respond) => {
  console.log(message);
  switch (message.command) {
    case 'autofill':
      let url = new URL(sender.tab.url);
      chrome.runtime.sendNativeMessage('io.github.schmich.ward', { host: url.host }, response => {
        if (chrome.runtime.lastError) {
          respond({ error: chrome.runtime.lastError.message });
        } else {
          respond({ username: '...', password: response.message });
        }
      });
      break;
  }
  return true;
});
