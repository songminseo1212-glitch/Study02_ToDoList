(function () {
  'use strict';

  var STORAGE_KEY = 'todo-app:v1';
  var MAX_LEN = 100;
  var CATEGORIES = {
    work: '업무',
    personal: '개인',
    study: '공부'
  };
  var FILTERS = ['all', 'work', 'personal', 'study'];

  var state = load();
  var editingId = null;

  var els = {
    form: document.getElementById('add-form'),
    text: document.getElementById('new-text'),
    category: document.getElementById('new-category'),
    tabs: document.getElementById('tabs'),
    list: document.getElementById('list'),
    empty: document.getElementById('empty'),
    clearDone: document.getElementById('clear-done'),
    progressText: document.getElementById('progress-text'),
    progressBar: document.getElementById('progress-bar'),
    progressFill: document.getElementById('progress-fill'),
    catProgress: document.getElementById('cat-progress')
  };

  /* ---------- 저장 / 불러오기 ---------- */

  function defaultState() {
    return { version: 1, todos: [], ui: { filter: 'all', lastCategory: 'work' } };
  }

  function load() {
    var s = defaultState();
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return s;
      var data = JSON.parse(raw);
      if (!data || !Array.isArray(data.todos)) return s;
      s.todos = data.todos
        .filter(function (t) { return t && typeof t.text === 'string'; })
        .map(function (t) {
          return {
            id: String(t.id),
            text: t.text.slice(0, MAX_LEN),
            category: CATEGORIES[t.category] ? t.category : 'work',
            done: t.done === true,
            createdAt: t.createdAt || new Date().toISOString()
          };
        });
      if (data.ui) {
        if (FILTERS.indexOf(data.ui.filter) !== -1) s.ui.filter = data.ui.filter;
        if (CATEGORIES[data.ui.lastCategory]) s.ui.lastCategory = data.ui.lastCategory;
      }
    } catch (e) {
      return defaultState();
    }
    return s;
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      /* 저장소를 쓸 수 없어도 앱은 계속 동작 */
    }
  }

  /* ---------- 상태 변경 ---------- */

  function newId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function commit() {
    save();
    render();
  }

  function addTodo(text, category) {
    text = text.trim();
    if (!text) return false;
    state.todos.push({
      id: newId(),
      text: text.slice(0, MAX_LEN),
      category: CATEGORIES[category] ? category : 'work',
      done: false,
      createdAt: new Date().toISOString()
    });
    state.ui.lastCategory = category;
    commit();
    return true;
  }

  function findTodo(id) {
    for (var i = 0; i < state.todos.length; i++) {
      if (state.todos[i].id === id) return state.todos[i];
    }
    return null;
  }

  function updateTodo(id, text, category) {
    var todo = findTodo(id);
    editingId = null;
    text = text.trim();
    if (todo && text) {
      todo.text = text.slice(0, MAX_LEN);
      if (CATEGORIES[category]) todo.category = category;
    }
    commit();
  }

  function toggleTodo(id) {
    var todo = findTodo(id);
    if (!todo) return;
    todo.done = !todo.done;
    commit();
  }

  function deleteTodo(id) {
    var todo = findTodo(id);
    if (!todo) return;
    if (!window.confirm('"' + todo.text + '" 항목을 삭제할까요?')) return;
    state.todos = state.todos.filter(function (t) { return t.id !== id; });
    if (editingId === id) editingId = null;
    commit();
  }

  function clearDone() {
    var count = state.todos.filter(function (t) { return t.done; }).length;
    if (!count) return;
    if (!window.confirm('완료한 ' + count + '개 항목을 모두 지울까요?')) return;
    state.todos = state.todos.filter(function (t) { return !t.done; });
    commit();
  }

  function setFilter(filter) {
    if (FILTERS.indexOf(filter) === -1) return;
    state.ui.filter = filter;
    commit();
  }

  /* ---------- 렌더링 ---------- */

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function percent(done, total) {
    return total === 0 ? 0 : Math.round((done / total) * 100);
  }

  function fillCategorySelect(select, value) {
    select.textContent = '';
    Object.keys(CATEGORIES).forEach(function (key) {
      var opt = el('option', '', CATEGORIES[key]);
      opt.value = key;
      select.appendChild(opt);
    });
    select.value = value;
  }

  function renderProgress() {
    var total = state.todos.length;
    var done = state.todos.filter(function (t) { return t.done; }).length;
    var pct = percent(done, total);
    els.progressText.textContent = done + ' / ' + total + ' · ' + pct + '%';
    els.progressFill.style.width = pct + '%';
    els.progressBar.setAttribute('aria-valuenow', String(pct));

    els.catProgress.textContent = Object.keys(CATEGORIES).map(function (key) {
      var inCat = state.todos.filter(function (t) { return t.category === key; });
      var d = inCat.filter(function (t) { return t.done; }).length;
      return CATEGORIES[key] + ' ' + d + '/' + inCat.length;
    }).join(' · ');
  }

  function renderTabs() {
    els.tabs.textContent = '';
    FILTERS.forEach(function (f) {
      var btn = el('button', 'tab', f === 'all' ? '전체' : CATEGORIES[f]);
      btn.type = 'button';
      btn.dataset.filter = f;
      btn.setAttribute('aria-pressed', String(state.ui.filter === f));
      els.tabs.appendChild(btn);
    });
  }

  function renderItem(todo) {
    var li = el('li', 'item' + (todo.done ? ' done' : ''));
    li.dataset.id = todo.id;

    if (todo.id === editingId) {
      var input = el('input', 'edit-text');
      input.type = 'text';
      input.maxLength = MAX_LEN;
      input.value = todo.text;
      input.setAttribute('aria-label', '할 일 수정');

      var select = el('select', 'edit-category');
      select.setAttribute('aria-label', '카테고리 수정');
      fillCategorySelect(select, todo.category);

      var actions = el('div', 'actions');
      var saveBtn = el('button', 'small', '저장');
      saveBtn.type = 'button';
      saveBtn.dataset.action = 'save';
      var cancelBtn = el('button', 'small', '취소');
      cancelBtn.type = 'button';
      cancelBtn.dataset.action = 'cancel';
      actions.appendChild(saveBtn);
      actions.appendChild(cancelBtn);

      li.appendChild(input);
      li.appendChild(select);
      li.appendChild(actions);
      return li;
    }

    var checkId = 'chk-' + todo.id;
    var check = el('input', 'check');
    check.type = 'checkbox';
    check.id = checkId;
    check.checked = todo.done;
    check.dataset.action = 'toggle';

    var label = el('label', 'text', todo.text);
    label.htmlFor = checkId;
    label.dataset.action = 'edit-dblclick';

    var badge = el('span', 'badge ' + todo.category, CATEGORIES[todo.category]);

    var acts = el('div', 'actions');
    var editBtn = el('button', 'small', '수정');
    editBtn.type = 'button';
    editBtn.dataset.action = 'edit';
    editBtn.setAttribute('aria-label', todo.text + ' 수정');
    var delBtn = el('button', 'small danger', '삭제');
    delBtn.type = 'button';
    delBtn.dataset.action = 'delete';
    delBtn.setAttribute('aria-label', todo.text + ' 삭제');
    acts.appendChild(editBtn);
    acts.appendChild(delBtn);

    li.appendChild(check);
    li.appendChild(label);
    li.appendChild(badge);
    li.appendChild(acts);
    return li;
  }

  function renderList() {
    var filter = state.ui.filter;
    var visible = state.todos.filter(function (t) {
      return filter === 'all' || t.category === filter;
    });
    els.list.textContent = '';
    visible.forEach(function (t) { els.list.appendChild(renderItem(t)); });
    els.empty.hidden = visible.length > 0;

    if (editingId) {
      var input = els.list.querySelector('.edit-text');
      if (input) {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
      }
    }
  }

  function render() {
    renderProgress();
    renderTabs();
    renderList();
    els.category.value = state.ui.lastCategory;
    els.clearDone.disabled = !state.todos.some(function (t) { return t.done; });
  }

  /* ---------- 이벤트 ---------- */

  function itemIdFrom(target) {
    var li = target.closest('.item');
    return li ? li.dataset.id : null;
  }

  function saveEdit(li) {
    var text = li.querySelector('.edit-text').value;
    var category = li.querySelector('.edit-category').value;
    updateTodo(li.dataset.id, text, category);
  }

  els.form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (addTodo(els.text.value, els.category.value)) {
      els.text.value = '';
    }
    els.text.focus();
  });

  els.category.addEventListener('change', function () {
    state.ui.lastCategory = els.category.value;
    save();
  });

  els.tabs.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-filter]');
    if (btn) setFilter(btn.dataset.filter);
  });

  els.list.addEventListener('click', function (e) {
    var actionEl = e.target.closest('[data-action]');
    if (!actionEl) return;
    var action = actionEl.dataset.action;
    var li = actionEl.closest('.item');
    var id = li ? li.dataset.id : null;
    if (!id) return;

    if (action === 'delete') deleteTodo(id);
    else if (action === 'edit') { editingId = id; render(); }
    else if (action === 'save') saveEdit(li);
    else if (action === 'cancel') { editingId = null; render(); }
  });

  els.list.addEventListener('change', function (e) {
    if (e.target.dataset.action === 'toggle') {
      var id = itemIdFrom(e.target);
      if (id) toggleTodo(id);
    }
  });

  els.list.addEventListener('dblclick', function (e) {
    var label = e.target.closest('.text');
    if (!label) return;
    var id = itemIdFrom(label);
    if (id) { editingId = id; render(); }
  });

  els.list.addEventListener('keydown', function (e) {
    if (!e.target.classList.contains('edit-text') &&
        !e.target.classList.contains('edit-category')) return;
    var li = e.target.closest('.item');
    if (e.key === 'Enter') { e.preventDefault(); saveEdit(li); }
    else if (e.key === 'Escape') { editingId = null; render(); }
  });

  els.clearDone.addEventListener('click', clearDone);

  /* ---------- 시작 ---------- */

  fillCategorySelect(els.category, state.ui.lastCategory);
  render();
})();
