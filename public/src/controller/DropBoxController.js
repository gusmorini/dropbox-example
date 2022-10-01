class DropBoxController {
  constructor() {
    this.btnSendFileEl = document.querySelector("#btn-send-file");
    this.inputFilesEl = document.querySelector("#files");
    this.snackModalEl = document.querySelector("#react-snackbar-root");

    this.progressBarEl = this.snackModalEl.querySelector(".mc-progress-bar-fg");
    this.nameFileEl = this.snackModalEl.querySelector(".filename");
    this.timeLeftEl = this.snackModalEl.querySelector(".timeleft");

    this.ulFilesEl = document.querySelector("#list-of-files-and-directories");

    this.btnNewFolder = document.querySelector("#btn-new-folder");
    this.btnRename = document.querySelector("#btn-rename");
    this.btnDelete = document.querySelector("#btn-delete");

    this.onselectionchange = new Event('onselectionchange');

    this.initEvents();
    this.listTask();
  }

  getSelection(){
    return this.ulFilesEl.querySelectorAll('.selected');
  }

  /**
   * update filename database
   */
  updateTask(file) {
    fetch(`/update/${file._id}`, { 
      method: "PUT", 
      headers: new Headers({
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify(file)
    })
      // .then(res => res.json().then(data => console.log(data)))
      .catch(e => console.error(e))
  }

  /**
   * remove file database from id
   */
   removeTask(file) {
    const { _id, path } = file
    fetch(`/delete/${_id}`, { 
      method: "DELETE", 
      headers: new Headers({
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify({ path })
     })
      // .then(res => res.json().then(data => console.log(data)))
      .catch(e => console.error(e))
   }

  initEvents() {

    this.btnNewFolder.addEventListener('click', e => {

      let name = prompt('nome da pasta', '')

      if (name) {
        this.saveTask({
          name,
          type: 'folder',
          size: 0
        })
      }

    });


    /** ação botão excluir */
    this.btnDelete.addEventListener('click', e => {
      // busca todos os itens selecionados e faz um forEach
      this.getSelection().forEach(li => {
        const file = JSON.parse(li.dataset.file)
        // remove o item do DOM
        li.remove();
        // remove o file do database
        this.removeTask(file)
      })
    })

    /** ação botão renomear */
    this.btnRename.addEventListener('click', e => {
      // pega o item selecionado
      const select = this.getSelection()[0]
      // faz um parse do dateset file
      let file = JSON.parse(select.dataset.file)
      // separa o nome da extensão
      let [name, ext] = file.name.split('.')
      // seleciona o div do texto
      let div = select.querySelector('.name')
      // insere um texarea no lugar do texto
      div.innerHTML = `<textarea id='rename-item'>${name}</textarea>`
      // seleciona o input textarea
      let inputName = div.querySelector('#rename-item');
      // seleciona o conteúdo do textarea
      inputName.select();
      // evento ao perder o foco
      inputName.addEventListener('blur', e => {
        // verifica se o value está vazio e usa o valor antigo
        const value = e.target.value || name;
        // verifica se o arquivo tem extensão e monta o filename
        let filename = ext ? `${value}.${ext}` : value
        // atualiza o texto do div
        div.innerHTML = filename
        // verifica se os dados foram alterados
        if (value != name) {
          // atualiza o objeto file
          file.name = filename
          // atualiza o dataset.file
          select.dataset.file = JSON.stringify(file)
          // envia os novos dados para o database
          this.updateTask(file);
        }
      });
    });
    


    /** mostra ou oculta botões de ação */
    this.ulFilesEl.addEventListener('onselectionchange', e => {
      switch(this.getSelection().length) {
        case 0:
          this.btnRename.style.display = 'none'
          this.btnDelete.style.display = 'none'
          break;
        case 1:
          this.btnRename.style.display = 'block'
          this.btnDelete.style.display = 'block'
          break;
        default:
          this.btnRename.style.display = 'none'
          this.btnDelete.style.display = 'block'
          break;
      }
    });

    // click botão enviar arquivos
    this.btnSendFileEl.addEventListener("click", (event) => {
      this.inputFilesEl.click();
    });

    this.inputFilesEl.addEventListener("change", (event) => {
      // desativa botão upload de arquivos
      this.btnSendFileEl.disabled = true;
      // envia files para upload
      this.uploadTask(event.target.files)
        .then((responses) =>
          responses.forEach((resp) => this.saveTask(resp)))
          .catch(e => console.error(e));
      // abre modal
      this.modalShow();
    });
  }

  /** toggle modal */
  modalShow(show = true) {
    this.snackModalEl.style.display = show ? "block" : "none";
  }

  /** salva os dados do arquivo no database */
  saveTask(file) {
    fetch("/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(file),
    })
      .then((resp) => {
        resp.json().then((data) => {
          this.addItemList(data);
          this.uploadComplete();
        });
      })
      .catch((e) => console.error(e));
  }

  /** busca os dados saldos no database */
  listTask() {
    fetch("/list")
      .then((resp) => {
        resp.json().then((data) => this.addItemsList(data));
      })
      .catch((e) => console.error(e));
  }

  uploadComplete() {
    // zera o campo files
    this.modalShow(false);
    this.inputFilesEl.value = "";
    // ativa botão upload de arquivos
    this.btnSendFileEl.disabled = false;
  }

  /** faz upload dos arquivos para o servidor */
  uploadTask(files) {
    let promises = [];

    [...files].forEach((file) => {
      promises.push(
        new Promise((resolve, reject) => {
          // formData
          let formData = new FormData();
          formData.append("input-file", file);
          // instância do "ajax" XMLHttpRequest
          const ajax = new XMLHttpRequest();
          // abre a requisição
          ajax.open("POST", "/upload");

          ajax.onload = (event) => {
            try {
              resolve(JSON.parse(ajax.responseText));
            } catch (e) {
              this.uploadComplete();
              reject(e);
            }
          };
          // trataiva de erros
          ajax.onerror = (event) => {
            // fecha modal
            this.uploadComplete();
            reject(event);
          };
          // status upload arquivos
          ajax.upload.onprogress = (event) => {
            this.uploadProgress(event, file);
          };
          // hora atual inicio upload
          this.startUploadTime = Date.now();
          // envia os dados
          ajax.send(formData);
        })
      );
    });

    return Promise.all(promises);
  }

  /** tratativa para upload de arquivos */
  uploadProgress(event, file) {
    const { loaded, total } = event;
    const { name } = file;
    // porcentagem upload
    const porcent = parseInt((loaded / total) * 100);
    // tempo gasto upload
    const timespent = Date.now() - this.startUploadTime;
    // tempo restante
    const timeleft = ((100 - porcent) * timespent) / porcent;
    // barra progresso el
    this.progressBarEl.style.width = `${porcent}%`;
    // texto nome do arquivo el
    this.nameFileEl.textContent = name;
    // texto tempo restante el
    this.timeLeftEl.textContent = this.formatTimeToHuman(timeleft);
    // fecha modal e reinicia componentes
  }

  /** formata milesegundos de forma amigável */
  formatTimeToHuman(duration) {
    // converte milesegundos em segundos
    const seconds = parseInt((duration / 1000) % 60);
    // converte milesegundos em minutos
    const minutes = parseInt((duration / (1000 * 60)) % 60);
    // converte milesegundos em horas
    const hours = parseInt((duration / (1000 * 60 * 60)) % 24);
    // determina qual msg será exibida
    if (hours > 0) {
      return `${hours} horas, ${minutes} minutos e ${seconds} segundos`;
    } else if (minutes > 0) {
      return `${minutes} minutos e ${seconds} segundos`;
    } else if (seconds > 0) {
      return `${seconds} segundos`;
    } else {
      return "instantes";
    }
  }

  /** retorna o ícone correspondente ao arquivo */
  getFileIconView(file) {

    switch (file.type) {
      case "folder":
        return `<i class="bi bi-folder"></i>`;
      
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return `<i class="bi bi-file-image file-image"></i>`;
      
      case "pdf":
        return `<i class="bi bi-file-pdf file-pdf"></i>`;
      
      case "mp3":
        return `<i class="bi bi-filetype-mp3 file-music"></i>`;
      
      case "mkv":
      case "mp4":
      case "avi":
        return `<i class="bi bi-file-play file-video"></i>`;
      
      case "zip":
      case "rar":
        return `<i class="bi bi-file-zip file-zip"></i>`;

      case "doc":
      case "docx":
        return `<i class="bi bi-file-word file-doc"></i>`;

      case 'ppt':
      case 'pptx':
        return `<i class="bi bi-file-ppt file-ppt"></i>`
      
      default:
        return `<i class="bi bi-file-binary"></i>`;
    }
  }

  /** formata o el li para exibição do arquivo */
  getFileView(file) {
    let li = document.createElement('li');
    li.dataset.key = file._id;
    li.dataset.file = JSON.stringify(file);
    li.innerHTML = `
      ${this.getFileIconView(file)} 
      <div class="name text-center">${file.name}</div>`;
    this.initEventsLi(li);
    return li;
  }

  // inicia eventos no li informado
  initEventsLi(li) {
    li.addEventListener('click', e => {
      // nome da classe html a ser alterada
      const htmlClass = 'selected'
      // elemento "pai" ao li selecionado no caso "ul"
      const parent_element = li.parentElement;
      // lista de todos os "li's" dentro do elemento pai selecionado
      const list_elements = parent_element.childNodes;

      /**
       * verifica se o shift esta pressionado
       * então os itens no intervalo entre
       * os 2 itens selecionados serão selecionados
       */
      if (e.shiftKey) {
        // primeiro elemento selecionado
        let el_start = parent_element.querySelector('.' + htmlClass)
        // se já existir um elemento selecionado                    
        if (el_start) {
          // index a serem preenchidos inicial e final selecionados
          let index_start = null
          let index_end = null
          // percorre a lista de "li's"
          list_elements.forEach((el, index) => {
            // se o elemento for igual o primeiro elemento recupera o index
            if (el === el_start) index_start = index
            // se o elemento for igual ao último elemento selecionado recupera o index
            if (el === li) index_end = index
          });
          // se os 2 index forem preenchidos
          if (index_start != null && index_end != null) {
            // ordena os index independente da ordem selecionada
            const index_interval = [index_start, index_end].sort();
            /**
             * percorre a lista novamente se o index estiver
             * dentro do intervalo de index inicial e final
             * a classe é adicionada
             */
            list_elements.forEach((el, index) => {
              if (index >= index_interval[0] && index <= index_interval[1]) {
                el.classList.add(htmlClass);
              }
            })
            // retorna para evitar um toggle no ultimo item selecionado
            
            // dispara o evento personalizado ao mudar a lista
            parent_element.dispatchEvent(this.onselectionchange)
            return true;
          }
        }

      }

      /**
       * verifica se a tecla ctrl não está pressionada
       * então remove a seleção das outras classes
       * deixando somente a última selecionada
       */
       if(!e.ctrlKey) {
        list_elements.forEach(li => li.classList.remove(htmlClass))
      }

      // altera classe do li selecionado
      li.classList.toggle(htmlClass);
      
      // dispara o evento personalizado ao mudar a lista
      parent_element.dispatchEvent(this.onselectionchange)

    });
  }

  // recebe apenas um item para ser inserido na lista
  addItemList(item) {
    this.ulFilesEl.append(this.getFileView(item))
  }

  /** recebe um array e insere os itens na lista UL */
  addItemsList(items) {
    items.forEach(item => this.addItemList(item));
  }


}
