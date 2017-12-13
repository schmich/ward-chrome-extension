function getUserInput(passwordInput) {
  if (!passwordInput) {
    return null;
  }

  const form = passwordInput.form;
  const fieldNames = ['username', 'user', 'email', 'login', 'name'];

  for (let name of fieldNames) {
    let input = form.querySelector(`input[name~="${name}"]`)
             || form.querySelector(`input[id~="${name}"]`)
             || form.querySelector(`input[name*="${name}"]`)
             || form.querySelector(`input[id*="${name}"]`);

    if (input) {
      return input;
    }
  }

  return null;
}

let passwordInputs = document.querySelectorAll('input[type="password"]');
for (let input of passwordInputs) {
  let button = document.createElement('img');
  button.classList.add('ward-autofill-button');
  button.src = chrome.runtime.getURL('asterisk.svg');
  button.title = 'Autofill with Ward';

  const positionImage = () => {
    let rect = input.getBoundingClientRect();
    let left = rect.left + window.scrollX;
    let top = rect.top + window.scrollY;

    const padding = Math.floor(rect.height * 0.25);
    let size = rect.height;
    button.style.height = button.style.width = `${size}px`;
    button.style.left = `${(left + rect.width - size)}px`;
    button.style.padding = `${padding}px`;
    button.style.top = `${top}px`;
  };

  positionImage();
  document.body.appendChild(button);

  const userInput = getUserInput(input);
  button.onmouseover = () => {
    input.classList.add('ward-autofill')
    userInput.classList.add('ward-autofill');
  };
  button.onmouseout = () => {
    input.classList.remove('ward-autofill');
    userInput.classList.remove('ward-autofill');
  };
  button.onclick = () => {
    chrome.runtime.sendMessage(null, { command: 'autofill' }, null, response => {
      userInput.value = response.username;
      input.value = response.password;
    });
  };

  const observer = new ResizeObserver(() => positionImage());
  observer.observe(input);
  observer.observe(document.body);
}
