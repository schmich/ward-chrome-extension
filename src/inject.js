function findUsernameInput(passwordInput) {
  if (!passwordInput) {
    return null;
  }

  const form = passwordInput.form;
  const fieldNames = [
    'username',
    'Username',
    'UserName',
    'user',
    'User',
    'email',
    'Email',
    'login',
    'Login',
    'name',
    'Name'
  ];

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

function attachPassword(input) {
  let button = document.createElement('img');
  button.classList.add('ward-autofill-button');
  button.src = chrome.runtime.getURL('autofill.svg');
  button.title = 'Autofill with Ward';
  button.style.display = 'none';

  let show = 0;
  const showButton = () => {
    if (++show > 0) {
      let rect = input.getBoundingClientRect();
      let left = rect.left + window.scrollX;
      let top = rect.top + window.scrollY;

      const padding = Math.floor(rect.height * 0.25);
      let size = rect.height;
      button.style.height = button.style.width = `${size}px`;
      button.style.left = `${(left + rect.width - size)}px`;
      button.style.padding = `${padding}px`;
      button.style.top = `${top}px`;
      button.style.display = 'block';
    }
  };

  const hideButton = () => {
    if (--show === 0) {
      button.style.display = 'none';
    }
  };

  input.addEventListener('mouseenter', () => showButton());
  input.addEventListener('mouseleave', () => hideButton());

  const usernameInput = findUsernameInput(input);

  button.addEventListener('mouseenter', () => {
    showButton();
    input.classList.add('ward-autofill')
    usernameInput.classList.add('ward-autofill');
  });

  button.addEventListener('mouseleave', () => {
    hideButton();
    input.classList.remove('ward-autofill');
    usernameInput.classList.remove('ward-autofill');
  });

  button.addEventListener('click', () => {
    chrome.runtime.sendMessage(null, { command: 'autofill' }, null, response => {
      if (response.error) {
        alert(response.error);
      } else {
        usernameInput.value = response.username;
        input.value = response.password;
      }
    });
  });

  document.body.appendChild(button);
}

function attachPasswords(parent) {
  if (!parent.querySelectorAll) {
    return;
  }
  let passwordInputs = parent.querySelectorAll('input[type="password"]');
  for (let input of passwordInputs) {
    attachPassword(input);
  }
}

const observer = new MutationObserver(mutations => {
  for (let mutation of mutations) {
    for (let addedNode of mutation.addedNodes) {
      attachPasswords(addedNode);
    }
  }
});

observer.observe(document.body, { childList: true, subtree: true });

attachPasswords(document.body);
