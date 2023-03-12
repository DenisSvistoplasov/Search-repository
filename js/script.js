{
  const RESULT_LIMIT_COUNT = 10;
  const DEFAULT_USER_ICON = './img/default-user-icon.svg';

  const form = document.querySelector('.form');
  const input = form.elements.search;
  const resultsList = document.querySelector('.results-list');
  const formControlsEl = document.querySelector('.form__controls');
  const preloader = document.querySelector('.preloader');
  const notFound = document.querySelector('.not-found');
  const serverErrorEl = document.querySelector('.server-error');
  const saver = document.querySelector('.saver');

  form.addEventListener('submit', onSubmit);
  input.addEventListener('input', onInput);


  function onSubmit(event) {
    event.preventDefault();
    const searchString = input.value.trim();

    if (checkValidity()) makeSearchRequest(searchString);
    else input.focus();
  }
  
  function checkValidity() {
    const errorMessages = [...form.querySelectorAll('.error-message')];
    errorMessages.forEach(el => el.remove());

    const value = input.value.trim();

    if (/[{}|\\^~[\]`]/.test(value)) {
      formControlsEl.append(createValidationErrorMessage('Недопустимые символы: {}|\\^~[]`'));
      return false;
    } 
    if (value.length < 3) {
      formControlsEl.append(createValidationErrorMessage('Введите не менее 3-х символов'));
      return false;
    }

    return true;
  }

  function createValidationErrorMessage(text) {
    const errorMessageElement = document.createElement('div');
    errorMessageElement.className = 'error-message';
    errorMessageElement.textContent = text;
    return errorMessageElement;
  }

  function makeSearchRequest(searchString) {
    clearResultsPlace();

    preloader.classList.add('visible');
    search(searchString)
      .then(results => {
        notFound.classList.toggle('visible', results.length === 0);

        results.forEach(result => {
          const resultItem = createSearchResultItem(result);
          resultsList.append(resultItem);
        });
      })
      .catch(error => {
        serverErrorEl.textContent = 'Ответ сервера: '+error;
        serverErrorEl.classList.add('visible');
      })
      .finally(() => preloader.classList.remove('visible'));
  }

  function clearResultsPlace() {
    resultsList.innerHTML = '';

    notFound.classList.remove('visible');
    serverErrorEl.classList.remove('visible');
    saver.classList.remove('visible');
  }

  async function search(query, resultCount = RESULT_LIMIT_COUNT) {
    let response = await fetch('https://api.github.com/search/repositories?q=' + query+'&per_page='+resultCount);
    response = await response.json();

    if (!response.items) return Promise.reject(response.message);

    const results = response.items.slice(0, resultCount).map(item => ({
      userName: item.owner.login,
      userImg: item.owner.avatar_url || DEFAULT_USER_ICON,
      userLink: item.owner.html_url,
      repositoryName: item.name,
      date: new Date(item.updated_at),
      description: item.description || '-',
      repositoryLink: item.html_url
    }));

    return results;
  }

  function createSearchResultItem({userName, userImg, repositoryName, date, description, userLink, repositoryLink}) {
    const item = document.createElement('li');
    item.className = 'result';
    item.innerHTML = `
    <a href="${userLink}" target="_blank" class="user">
      <img src="${userImg}" alt="Аватар пользователя" class="user__img">
      <div class="user__name" title="${userName}">${userName}</div>
    </a>
    <div class="repository">
      <div class="repository__name-date">
        <a href="${repositoryLink}" target="_blank" class="repository__name">${repositoryName}</a>
        <span class="repository__date">${date.toLocaleDateString()}</span>
      </div>
      <div class="repository__description">${description}</div>
    </div>`;
    return item;
  }

  function onInput(event) {
    const errorMessageElement = event.target.parentElement.querySelector('.error-message');
    errorMessageElement?.remove();
  }

}
