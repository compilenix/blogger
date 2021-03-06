var skey = 83
var vkey = 86
var nkey = 78
var wkey = 87

class Editor {
  constructor () {
    this.postlistContainer = document.getElementById('postlist')
    this.editorContainer = document.getElementById('edit')
    this.tabsContainer = document.getElementById('tabs')
    this.menu = document.getElementById('menu')
    this.ace = ace.edit('edit')
    this.ace.setTheme('ace/theme/monokai')
    this.ace.getSession().setMode('ace/mode/html')

    this.ApiKey = this.loadApiKey()
    this.sessions = {}
    this.sessions.default = this.ace.getSession()

    this.sessions.default.on('change', (event) => {
      if (event.data.action === 'insertText') {
        const name = Math.floor(new Date().getTime() / 1000).toString(16)
        e.newSession(name, e.sessions.default.getValue(), true)
        e.ace.navigateFileEnd()
        e.sessions.default.setValue('')
      }
    })

    document.addEventListener('keydown', (event) => {
      switch (event.keyCode) {
        case skey:
          if (event.ctrlKey || event.altKey) {
            event.preventDefault()
            if ($('#tabs div.active')[0]) {
              e.save($($('#tabs div.active')[0]).attr('data-postid'))
            }
          }
          break
        case nkey:
          if (event.ctrlKey || event.altKey) {
            event.preventDefault()
            e.emptyTab()
          }
          break
        case vkey:
          if (event.ctrlKey && $('#tabs div.active')[0] === undefined) {
            e.emptyTab()
          }
          break
        case wkey:
          if (event.ctrlKey || event.altKey) {
            event.preventDefault()
            e.closeTab($($('#tabs div.active')[0]).attr('data-postid'))
          }
      }

      if ($('#tabs div.active')[0] === undefined) {
        e.emptyTab()
      }
    })

    if (!this.ApiKey) {
      this.askForKey(() => {
        e.requestPostlist()
      })
    } else {
      this.requestPostlist()
    }
  }

  request (post, callback) {
    $.post('/ajax/', post, (data) => {
      e.handleResponse(data)

      if (typeof callback === 'function') {
        callback(data)
      }
    }, 'json').fail((xhr, status) => {
      e.askForKey(() => {
        e.requestPostlist()
      })

      if (typeof callback === 'function') {
        callback(xhr, status)
      }
    })
  }

  handleResponse (data) {
    if (data.type) {
      switch (data.type) {
        case 'postlist':
          this.updatePostList(data)
          break
        case 'post':
          this.loadPost(data)
          break
        case 'postsaved':
          this.postSaved(data.id)
          break
        case 'postremoved':
        case 'postnotfound':
          this.postRemoved(data.id)
          break
        default:
          console.log('handleResponse: unknown response type')
          swal('Error!', 'Got unexpexted response!', 'error')
          break
      }
    }
  }

  askForKey (callback) {
    swal({
      title: 'Password needed',
      type: 'input',
      inputType: 'password',
      showCancelButton: false,
      showLoaderOnConfirm: true,
      closeOnConfirm: true
    }, (typedPassword) => {
      e.ApiKey = typedPassword
      e.storeApiKey(typedPassword)
      if (typeof callback === 'function') {
        callback()
      }
    })
  }

  loadApiKey () {
    return localStorage.ApiKey
  }

  storeApiKey (ApiKey) {
    localStorage.setItem('ApiKey', ApiKey)
  }

  loadPost (data) {
    console.log('show post: ' + data.title + ' (' + data.id + ')')
    this.newSession(data.id, data.content.contents, false, data.title)
  }

  postSaved (id) {
    $(this.tabsContainer).find('div[data-postid=' + id + ']').removeClass('changed')
    this.requestPostlist()
    this.closeTab(id)
    this.showPost(id)
  }

  updatePostList (data) {
    const ul = document.createElement('ul')

    for (let i = 0; i < data.list.length; i++) {
      const li = document.createElement('li')
      li.appendChild(document.createTextNode(data.titles[i]))
      li.setAttribute('data-postid', data.list[i].id)

      if (data.list[i].isPublished) {
        li.classList.add('published')
      }

      $(li).on('click', (ev) => {
        $('#postlist').removeClass('active')
        e.showPost(li.getAttribute('data-postid'))
      })

      ul.appendChild(li)
    }

    this.postlistContainer.innerHTML = ''
    this.postlistContainer.appendChild(ul)
  }

  requestPostlist () {
    this.request({
      ApiKey: this.ApiKey,
      action: 'postlist'
    })
  }

  requestPost (id) {
    this.request({
      ApiKey: this.ApiKey,
      postid: id,
      action: 'getpost'
    })
  }

  requestSavePost (id, title, content, callback) {
    this.request({
      ApiKey: this.ApiKey,
      postid: id,
      title: title,
      content: content,
      action: 'writepost'
    }, callback)
  }

  save (id) {
    if (!id) {
      swal('Error!', 'No tab/file selected for saving', 'error')
      return false
    }

    swal({
      title: 'Enter a nice title',
      type: 'input',
      showCancelButton: true,
      closeOnConfirm: false,
      closeOnCancel: false,
      showLoaderOnConfirm: true,
      inputValue: $($('#tabs div.active')[0]).attr('data-posttitle')
    }, function (title) {
      if (title === false) {
        swal('Save canceled', null, 'error')
        return false
      }

      if (!title || title == '') {
        swal.showInputError('You need to write something!')
        return false
      }

      e.requestSavePost(
        id,
        title,
        e.sessions[$($('#tabs div.active')[0]).attr('data-postid')].getValue(),
        function (data, status) {
          if (status == 'error') {
            swal('Error!', "The post can't be saved!", 'error')
          } else {
            swal('Nice!', 'Done', 'success')
          }
        }
      )
    })

    return true
  }

  showPost (id) {
    if (this.hasSession(id)) {
      this.openSession(id)
    } else {
      this.requestPost(id)
    }
  }

  emptyTab () {
    const name = Math.floor(new Date().getTime() / 1000).toString(16)
    e.newSession(name, '', true)
  }

  togglePublish () {
    const postId = $('#tabs div.active').attr('data-postid')

    e.request({
      ApiKey: e.ApiKey,
      action: 'togglePublish',
      postid: postId
    }, (data, status, error) => {
      e.requestPostlist()

      if (error || !data.OperationSucceded) {
        swal('Error!', 'Action failed :/', 'error')
      } else {
        swal('Done!', 'It worked', 'success')
      }
    })
  }

  remove () {
    const postId = $('#tabs div.active').attr('data-postid')
    const postTitle = $('#tabs div.active').attr('data-posttitle')

    swal({
      title: 'Are you sure?',
      text: 'Remove "' + postTitle + '" (' + postId + ')?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DD6B55',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel please!',
      showLoaderOnConfirm: true,
      closeOnConfirm: false,
      closeOnCancel: true
    },
    (isConfirmed) => {
      if (isConfirmed) {
        console.log('remove post: "' + postTitle + '" (' + postId + ')')

        e.request({
          ApiKey: e.ApiKey,
          action: 'removepost',
          postid: postId
        }, (data, status, error) => {
          if (error) {
            swal('Error!', 'The post "' + postTitle + '" (' + postId + ") couldn't be deleted.", 'error')
          } else {
            swal('Deleted!', 'The post "' + postTitle + '" (' + postId + ') has been deleted.', 'success')
          }
        })
      } else {
        swal('Cancelled', '"' + postTitle + '" (' + postId + ') is safe :)', 'error')
        return false
      }
    }
    )
  }

  postRemoved (id) {
    this.closeTab(id)
    this.requestPostlist()
  }

  addTab (id, isnew, title) {
    const tab = document.createElement('div')
    const inner = document.createElement('div')
    const wrapper = document.createElement('div')
    const closebutton = document.createElement('div')

    closebutton.setAttribute('data-postid', id)
    $(closebutton).addClass('button')
    $(wrapper).addClass('wrapper')
    tab.setAttribute('data-postid', id)
    tab.setAttribute('data-posttitle', isnew ? id + ' (new Post)' : title)

    $(tab).on('click', (ev) => {
      ev.preventDefault()
      e.openSession(tab.getAttribute('data-postid'))
      return false
    })

    $(closebutton).on('click', (ev) => {
      ev.preventDefault()
      e.closeTab(tab.getAttribute('data-postid'), ev.target.parentElement.parentElement.parentElement)
      return false
    })

    wrapper.appendChild(document.createTextNode(isnew ? id + ' (new Post)' : title))
    wrapper.appendChild(closebutton)
    inner.appendChild(wrapper)
    tab.appendChild(inner)
    this.tabsContainer.appendChild(tab)

    return tab
  }

  /**
     * @param {string} id
     * @param {HTMLElement | null} tabElement
     */
  closeTabForce (id, tabElement) {
    const postTitle = $(this.tabsContainer).find('div[data-postid=' + id + ']').attr('data-posttitle')
    console.log('close tab and discard changes of: "' + postTitle + '" (' + id + ')')

    if (id === $('#tabs div.active').attr('data-postid')) {
      var p = $(e.tabsContainer).find('div[data-postid=' + id + ']')[0].previousSibling
      var n = $(e.tabsContainer).find('div[data-postid=' + id + ']')[0].nextSibling

      if (n && n.getAttribute && n.getAttribute('data-postid')) {
        e.openSession(n.getAttribute('data-postid'))
      } else if (p && p.getAttribute && p.getAttribute('data-postid')) {
        e.openSession(p.getAttribute('data-postid'))
      } else {
        e.ace.setSession(e.sessions.default)
        e.ace.focus()
        e.emptyTab()
      }
    }

    $(e.tabsContainer).find('div[data-postid=' + id + ']').remove()
    e.sessions[id] = false

    e.calculateEditorOffsetTop()
  }

  /**
     * @param {string} id
     * @param {HTMLElement | null} tabElement
     */
  closeTab (id, tabElement = null) {
    const postTitle = $(this.tabsContainer).find('div[data-postid=' + id + ']').attr('data-posttitle')

    if ($(this.tabsContainer).find('div[data-postid=' + id + ']').hasClass('changed')) {
      swal({
        title: 'Are you sure?',
        text: `Discard any changes of ${postTitle}?`,
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#DD6B55',
        confirmButtonText: 'Yes, discard it!',
        cancelButtonText: 'No, cancel please!',
        showLoaderOnConfirm: true,
        closeOnConfirm: true,
        closeOnCancel: true
      },
      (isConfirmed) => {
        if (isConfirmed) {
          this.closeTabForce(id, tabElement)
        }
      }
      )
    } else {
      this.closeTabForce(id, tabElement)
    }
  }

  activeTabId () {
    if ($('#tabs div.active')[0] === undefined) {
      return false
    } else {
      return $('#tabs div.active')[0].getAttribute('data-postid')
    }
  }

  prevTabId () {
    var p = $(this.tabsContainer).find('div[data-postid=' + this.activeTabId() + ']')[0].previousSibling

    if (p && p.getAttribute && p.getAttribute('data-postid')) {
      return p.getAttribute('data-postid')
    } else {
      return false
    }
  }

  nextTabId () {
    var n = $(this.tabsContainer).find('div[data-postid=' + this.activeTabId() + ']')[0].nextSibling

    if (n && n.getAttribute && n.getAttribute('data-postid')) {
      return n.getAttribute('data-postid')
    } else {
      return false
    }
  }

  prevTab () {
    if (this.hasPrevTab()) {
      this.openSession(this.prevTabId())
    }
  }

  nextTab () {
    if (this.hasNextTab()) {
      this.openSession(this.nextTabId())
    }
  }

  hasPrevTab (id) {
    id = id || this.activeTabId()
    var p = $(this.tabsContainer).find('div[data-postid=' + id + ']')[0].previousSibling
    return (p && p.getAttribute && p.getAttribute('data-postid'))
  }

  hasNextTab (id) {
    id = id || this.activeTabId()
    var n = $(this.tabsContainer).find('div[data-postid=' + id + ']')[0].nextSibling
    return (n && n.getAttribute && n.getAttribute('data-postid'))
  }

  updateTabButtons () {
    if (this.hasNextTab()) {
      $('.buttonRight').show()
    } else {
      $('.buttonRight').hide()
    }
    if (this.hasPrevTab()) {
      $('.buttonLeft').show()
    } else {
      $('.buttonLeft').hide()
    }
  }

  activateTab (id) {
    $('#tabs div').removeClass('active')
    $(this.tabsContainer).find('div[data-postid=' + id + ']').addClass('active')
  }

  hasSession (id) {
    return this.sessions[id]
  }

  newSession (id, content, isnew, title) {
    var tab = this.addTab(id, isnew, title)
    this.sessions[id] = ace.createEditSession(content || '', 'ace/mode/html')

    this.sessions[id].on('change', (e) => {
      $(tab).addClass('changed')
    })

    if (isnew && content !== '') {
      $(tab).addClass('changed')
    }

    this.openSession(id)
    this.calculateEditorOffsetTop()
  }

  calculateEditorOffsetTop () {
    if (window.innerWidth <= 600) {
      this.editorContainer.style.top = this.tabsContainer.offsetHeight + parseInt(window.getComputedStyle(this.menu).getPropertyValue(
        'height').replace('px', '')) + 'px'
      return
    }
    this.editorContainer.style.top = this.tabsContainer.offsetHeight + parseInt(window.getComputedStyle(this.tabsContainer)
      .getPropertyValue('top').replace('px', '')) + 'px'
  }

  openSession (id) {
    this.activateTab(id)
    this.ace.setSession(this.sessions[id])
    this.ace.focus()
    this.updateTabButtons()
  }

  preview () {
    $.post('/ajax/', {
      ApiKey: e.ApiKey,
      action: 'previewpost',
      content: JSON.stringify(this.sessions[$($('#tabs div.active')[0]).attr('data-postid')].getValue()),
      title: $($('#tabs div.active')[0]).attr('data-posttitle')
    },
    (data) => {
      const win = window.open('about:blank')
      win.document.open()
      win.document.write(data)
      win.document.close()
    }
    )
  }
}

window.e = new Editor()
e.emptyTab()
