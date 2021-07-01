const urlViaCep = 'https://viacep.com.br/ws';
const urlAddressAPI =
  'https://608850faa6f4a3001742632f.mockapi.io/api/v1/endereco';
const btnSearchCEP = document.querySelector('#search');
const btnSaveAddress = document.querySelector('#saveAddress');
const btnListAddress = document.querySelector('#list');

/*******************************
 * BUTTONS
 *******************************/

if (btnSearchCEP) {
  btnSearchCEP.addEventListener('click', (event) => {
    event.preventDefault();
    searchPostCode();
  });
}

if (btnListAddress) {
  btnListAddress.addEventListener('click', () => {
    event.preventDefault();
    searchAllAddress();
  });
}

if (btnSaveAddress) {
  btnSaveAddress.addEventListener('click', (event) => {
    event.preventDefault();
    getAddress();
  });
}

/*******************************
 * CRUD
 *******************************/

//Busca o CEP na API
function searchPostCode() {
  let postcode = document.querySelector('#search-name').value.trim();
  if (postcode != '') {
    postcode = postcode.replace(/[^0-9]/g, '');
    const urlParams = `${urlViaCep}/${postcode}/json/`;
    fetch(urlParams)
      .then((response) => response.json())
      .then((result) => {
        const storePostCode = result;
        if (!storePostCode.erro) {
          cleanInputFields();
          hideElement(false, 'show-form');
          showPostCode(storePostCode);
        } else {
          hideElement(true, 'show-form');
          cleanInputFields();
          showMessageFromUser('CEP não encontrado!');
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }
}

//Busca todos os endereços salvos
function searchAllAddress() {
  fetch(urlAddressAPI, {
    method: 'get',
  })
    .then((response) => response.json())
    .then((result) => {
      const storeAddress = result;
      hideElement(false, 'card-address');
      hideElement(true, 'show-message');
      createCardsAddress(storeAddress);
    })
    .catch((err) => {
      console.error(err);
    });
}

//verifica se já existe o endereço na API,
//caso exista faz uma atualizacao,
//senão existir, salva
function getAddress() {
  let postcode = document.querySelector('#cep').value.trim();
  fetch(`${urlAddressAPI}?cep=${postcode}`, {
    method: 'get',
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.length > 0) {
        const storeAddress = result[0];
        updateAddress(storeAddress.id);
      } else {
        saveAddress();
      }
    })
    .catch((err) => {
      console.error(err);
    });
}

//atualiza o endereço
function updateAddress(id) {
  const addressData = getAddressData();
  fetch(`${urlAddressAPI}/${id}`, {
    method: 'put',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...addressData }),
  })
    .then((response) => response.json())
    .then((result) => {
      hideElement(true, 'show-form');
      showMessageFromUser('Endereço atualizado com sucesso!');
    })
    .catch((err) => {
      console.error(err);
    });
}

//Salva o endereço
function saveAddress() {
  const addressData = getAddressData();
  fetch(urlAddressAPI, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...addressData }),
  })
    .then((response) => response.json())
    .then((result) => {
      hideElement(true, 'show-form');
      showMessageFromUser('Endereço cadastrado com sucesso!');
    })
    .catch((err) => {
      console.error(err);
    });
}

//Remove um endereço
function removeAddress(id) {
  fetch(`${urlAddressAPI}/${id}`, {
    method: 'delete',
  })
    .then((result) => {
      if (result.ok) {
        searchAllAddress();
      } else {
        hideElement(true, 'card-address');
        showMessageFromUser('Não foi possível remover o endereço!');
      }
    })
    .catch((err) => {
      console.error(err);
    });
}

/*******************************
 * UTILITARIOS
 *******************************/

function setInputValue(input_id, val) {
  document.getElementById(input_id).setAttribute('value', val);
}

function hideElement(isToHide = true, id) {
  const form = document.getElementById(id);
  if (isToHide) {
    form.style.display = 'none';
  } else {
    form.style.display = 'flex';
  }
}

function showMessageFromUser(txt) {
  const messageSection = document.getElementById('show-message');
  messageSection.style.display = 'flex';
  messageSection.innerHTML = '';

  const h3 = document.createElement('h3');
  h3.className = 'h3-message';
  h3.innerHTML = txt;
  messageSection.appendChild(h3);
}

function cleanInputFields() {
  document.querySelector('#search-name').value = '';
  const form = document.getElementById('show-message');
  form.style.display = 'none';
}

/*******************************
 * CRIA ELEMENTOS
 *******************************/

function getAddressData() {
  const cep = document.querySelector('#cep').value;
  const logradouro = document.querySelector('#logradouro').value;
  const complemento = document.querySelector('#complemento').value;
  const bairro = document.querySelector('#bairro').value;
  const localidade = document.querySelector('#localidade').value;
  const uf = document.querySelector('#uf').value;
  const ibge = document.querySelector('#ibge').value;
  const gia = document.querySelector('#gia').value;
  const ddd = document.querySelector('#ddd').value;
  const siafi = document.querySelector('#siafi').value;
  const addressData = {
    cep: cep,
    logradouro: logradouro,
    complemento: complemento,
    bairro: bairro,
    localidade: localidade,
    uf: uf,
    ibge: ibge,
    gia: gia,
    ddd: ddd,
    siafi: siafi,
  };
  return addressData;
}

function showPostCode(postcodes) {
  Object.entries(postcodes).forEach(([key, value]) => {
    if (value != '') {
      setInputValue(key, value);
    }
  });
}

function createCardsAddress(store) {
  const infoCard = ['cep', 'logradouro', 'bairro', 'localidade', 'uf'];

  const sectionCardAddress = document.getElementById('card-address');
  sectionCardAddress.style.display = 'flex';
  sectionCardAddress.innerHTML = '';

  store.forEach((s) => {
    const divCard = document.createElement('div');
    divCard.className = 'card';
    Object.entries(s).forEach(([key, value]) => {
      if (key == 'id') {
        const button = createButton(value);
        divCard.appendChild(button);
      }
      if (infoCard.indexOf(key) > -1) {
        const p = document.createElement('p');
        p.innerHTML = `${key}: ${value}`;
        p.className = 'capitalized';
        divCard.appendChild(p);
      }
    });
    sectionCardAddress.appendChild(divCard);
  });
}

function createButton(idAddress) {
  const button = document.createElement('button');
  button.innerHTML = 'Deletar ';
  button.id = 'delete';
  button.value = idAddress;
  button.className = 'delete-address';
  button.onclick = () => {
    removeAddress(idAddress);
  };

  const i = document.createElement('i');
  i.className = 'fa fa-trash';
  button.appendChild(i);

  return button;
}
