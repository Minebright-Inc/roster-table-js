// class calendarInit

let current_month = 0
let current_year = 0

let current_users = []
let current_events = []

let timescale_changed = true

let roster_rotation_type = 'All'

let workgroup_mates = []

let event_id_clicked = -1
let user_id_clicked = -1
let potential_events = []
let potential_days_owed = 0
let event_type_options = []
let potential_cal_name = ''
let roster_status = 'All'
let roster_country = 'All'
let roster_city = 'All'
let roster_department = 'All'
let roster_workgroup = 'All'
let roster_role = 'All'
const roster_manager = 'All'

let roster_type = 'All'
let roster_user_type = 'All'
let roster_company = 'All'
let roster_active = 'All'
const roster_users = []
let roster_search = ''
/**
 * It takes in a list of users, a month, a year, and a boolean value, and returns a JSON object
 * containing the events for the given month and year
 * @param users - a list of user ids
 * @param month - The month you want to fetch events for.
 * @param year - The year of the calendar you want to display.
 * @param is_actual - true/false
 * @returns A promise that resolves to a JSON object.
 */
function fetchEventsJSON (users, month, year) {
  const uids = []
  for (let i = 0; i < users.length; i++) {
    uids.push(users[i].id)
  }

  const params = JSON.stringify({
    month: month + 1,
    year,
    users: uids
  })

  const http = new XMLHttpRequest()
  http.onload = function () {
    if (this.readyState == 4 && this.status == 200) {
      const response = JSON.parse(this.responseText)
      current_events = response.data
      console.log(response)
    }
  }
  http.open('POST', '/get_event_on_date/', false)
  http.setRequestHeader('Content-type', 'application/json; charset=utf-8')
  // http.setRequestHeader("Content-length", params.length);
  http.send(params)
}

function getWorgroupUsers (users) {
  const params = JSON.stringify({
    user_id: users[0].id
  })

  const http = new XMLHttpRequest()
  http.onload = function () {
    if (this.readyState == 4 && this.status == 200) {
      const response = JSON.parse(this.responseText)
      if (response.data != null) {
        workgroup_mates = response.data
        console.log(response.data)
      } else {
        workgroup_mates = []
        console.log('No workgroup mates')
      }
    }
  }
  http.open('POST', '/get_workgroup_mates/', false)
  http.setRequestHeader('Content-type', 'application/json; charset=utf-8')
  // http.setRequestHeader("Content-length", params.length);
  http.send(params)
}

function getEventTypes () {
  const http = new XMLHttpRequest()
  http.onload = function () {
    if (this.readyState == 4 && this.status == 200) {
      const response = JSON.parse(this.responseText)
      event_type_options = response.data
      console.log(response.data)
    }
  }
  http.open('GET', '/api/event_types/', false)
  http.send()
}

function getEventById (id) {
  const http = new XMLHttpRequest()
  http.onload = function () {
    if (this.readyState == 4 && this.status == 200) {
      const response = JSON.parse(this.responseText)
      event_type_options = response.data
      console.log(response.data)
    }
  }
  http.open('GET', '/get_event_by_id/', false)
  http.send()
}

function getEventByIdFromList (id, events) {
  for (let i = 0; i < events.length; i++) {
    if (events[i].id == id) {
      return events[i]
    }
  }
  return null
}

function getPotentialEventsJSON (
  user_id,
  event_id,
  new_start,
  is_projected,
  is_review = false
) {
  potential_events = []
  potential_days_owed = 0
  const params = JSON.stringify({
    user_id,
    event_id,
    new_start,
    is_projected,
    is_review
  })

  const http = new XMLHttpRequest()
  http.onload = function () {
    if (this.readyState == 4 && this.status == 200) {
      const response = JSON.parse(this.responseText)
      deleteNotification()
      if (response.data.success != null && response.data.success == false) {
        // createNotification(response.data['message'], response.data['type']);
        console.log(response.data)
      }
      potential_events = response.data.events
      potential_days_owed = response.data.days_owed
      const e = document.getElementById(
        'request_roster_project_personal_roster'
      )
      if (e != null) {
        e.checked = response.data.is_projected
      }
      console.log(response.data)
    }
  }
  http.open('POST', '/api/rosters/potential/', false)
  http.setRequestHeader('Content-type', 'application/json; charset=utf-8')
  // http.setRequestHeader("Content-length", params.length);
  http.send(params)
}

function postRosterChangeRequest (
  user_id,
  event_id,
  new_start,
  is_projected,
  from,
  to,
  comment,
  confirm_booking
) {
  potential_events = []
  potential_days_owed = 0
  const params = JSON.stringify({
    user_id,
    event_id,
    new_start,
    is_projected,
    from,
    to,
    comment,
    confirm_booking
  })

  const http = new XMLHttpRequest()
  http.onload = function () {
    if (this.readyState == 4 && this.status == 200) {
      const response = JSON.parse(this.responseText)
      deleteNotification()
      if (response.success != null && response.success == false) {
        createNotification(response.message, response.type)
        console.log(response)
      } else {
        location.reload()
      }
    }
  }
  http.open('POST', '/api/rosters/change/', false)
  http.setRequestHeader('Content-type', 'application/json; charset=utf-8')
  // http.setRequestHeader("Content-length", params.length);
  http.send(params)
}

function postNewEventRequest (
  user_id_clicked,
  event_id_clicked,
  start,
  end,
  event_type,
  travel_required,
  round_trip,
  departure_from,
  departure_to,
  departure_date,
  arrival_from,
  arrival_to,
  arrival_date
) {
  const params = $.ajax({
    type: 'POST',
    url: '/api/events/requests/add',
    data: {
      user_id: user_id_clicked,
      event_id: event_id_clicked,
      start,
      end,
      event_type,
      travel_required,
      round_trip,
      departure_from,
      departure_to,
      departure_date,
      arrival_from,
      arrival_to,
      arrival_date
    },
    success: function (response) {
      deleteNotification()
      if (response.success != null && response.success == false) {
        createNotification(response.message, response.type)
        console.log(response)
      } else {
        createNotification(response.message, response.type)
        console.log(response)
        setTimeout(location.reload.bind(location), 500)
      }
    }
  })
}

function DeleteEventRequest (user_id_clicked, event_id_clicked) {
  $.ajax({
    type: 'POST',
    url: '/api/events/requests/delete/',
    data: {
      user_id: user_id_clicked,
      event_id: event_id_clicked
    },
    success: function (response) {
      if (response.success != null && response.success == true) {
        location.reload()
      } else alert(response.message)
    }
  })
}

async function fetchAllCountries () {
  const options = {
    method: 'GET'
  }
  try {
    const data = await fetch('/api/countries', options)
    return await data.json()
  } catch (error) {
    console.log(error)
  }
}

async function fetchAllDepartments () {
  const options = {
    method: 'GET'
  }
  try {
    const data = await fetch('/api/departments', options)
    return await data.json()
  } catch (error) {
    console.log(error)
  }
}

async function fetchAllWorkgroups () {
  const options = {
    method: 'GET'
  }
  try {
    const data = await fetch('/api/workgroups', options)
    return await data.json()
  } catch (error) {
    console.log(error)
  }
}

async function fetchAllRoles () {
  const options = {
    method: 'GET'
  }
  try {
    const data = await fetch('/api/roles', options)
    return await data.json()
  } catch (error) {
    console.log(error)
  }
}

async function fetchUsersJSON (
  type,
  status,
  country,
  city,
  manager = null,
  role = null,
  workgroup = null
) {
  const params = {
    worgroup,
    city,
    country,
    type,
    status
  }

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  }
  try {
    fetch('/get_users/', options)
  } catch (error) {
    console.log(error)
  }
}

function deleteNotification () {
  const notification = document.getElementById('notification')
  if (notification != null) {
    notification.remove()
  }
}

function createNotification (message, type) {
  const notification = document.createElement('div')
  const notification_btn = document.createElement('button')
  const box = document.getElementById('new_event_modal_notification')
  notification_btn.classList.add('delete')
  notification.setAttribute('id', 'notification')
  notification.appendChild(notification_btn)
  notification.classList.add('notification')
  notification.innerHTML = message
  if (type == 'error') {
    notification.classList.add('is-danger')
  } else if (type == 'success') {
    notification.classList.add('is-success')
  } else if (type == 'warning') {
    notification.classList.add('is-warning')
  } else notification.classList.add('is-info')

  box.appendChild(notification)
}

/**
 * Delete the row with the given id.
 * @param rowid - The id of the row to be deleted.
 */

function deleteRow (rowid) {
  const row = document.getElementById(rowid)
  row.parentNode.removeChild(row)
}

/**
 * Delete the table body, then create a new one.
 * @param name - the name of the table
 */
function cleanBody (name) {
  deleteTableBody(name)
  createTableBody(name)
}

/**
 * It deletes the table header, creates a new one, and fills it with the appropriate data
 * @param name - the name of the table
 */

function cleanHead (name) {
  deleteTableHeader(name)
  createTableHeader(name)
  populateTableHeader(name)
}

/**
 * It takes a name and a list of users, and updates the roster with the new list of users
 * @param name - the name of the roster
 * @param users - an array of user objects
 */

function updateRoster (
  name,
  users,
  createFilter,
  createModal,
  is_potential_roster,
  is_review
) {
  cleanBody(name)
  setLabels(name)
  createRosterBody(
    name,
    users,
    createFilter,
    createModal,
    is_potential_roster,
    is_review
  )
  cleanHead(name)
  $('td, th').addClass('is-size-7')
}

/**
 * ChangeToCurrentMonth() changes the current month to the current month.
 * @param name - the name of the calendar
 * @param users - an array of objects, each object representing a user.
 */

function changeToCurrentMonth (
  name,
  users,
  createFilter,
  createModal,
  is_potential_roster,
  is_review
) {
  const today = new Date()
  current_month = today.getMonth()
  current_year = today.getFullYear()
  timescale_changed = true
  updateRoster(
    name,
    users,
    createFilter,
    createModal,
    is_potential_roster,
    is_review
  )
}

/**
 * It changes the current month to the next month
 * @param name - The name of the calendar.
 * @param users - an array of users
 */
function changeToNextMonth (
  name,
  users,
  createFilter,
  createModal,
  is_potential_roster,
  is_review
) {
  if (current_month == 11) {
    current_year++
    current_month = 0
  } else {
    current_month++
  }
  timescale_changed = true
  updateRoster(
    name,
    users,
    createFilter,
    createModal,
    is_potential_roster,
    is_review
  )
}

/**
 * It changes the current month to the previous month
 * @param name - The name of the calendar.
 * @param users - an array of users, each user is an object with the following properties:
 */

function changeToPrevMonth (
  name,
  users,
  createFilter,
  createModal,
  is_potential_roster,
  is_review
) {
  if (current_month == 0) {
    current_year--
    current_month = 11
  } else {
    current_month--
  }
  timescale_changed = true
  updateRoster(
    name,
    users,
    createFilter,
    createModal,
    is_potential_roster,
    is_review
  )
}

/**
 * Return the number of days in the given month and year.
 * @param month - The month to get the days for.
 * @param year - The year to get the days in month for.
 * @returns The number of days in the month.
 */
function daysInMonth (
  month,
  year,
  createFilter,
  createModal,
  is_potential_roster
) {
  return new Date(year, month + 1, 0).getDate()
}

/**
 * It creates a table header for the table with the given name
 * @param name - the name of the table
 */
function populateTableHeader (name) {
  const numDays = daysInMonth(current_month, current_year)

  const table_header = document.getElementById('table_header_' + name)

  const row = document.createElement('tr')
  const today = new Date()

  row.setAttribute('id', 'header_row_' + name)
  table_header.appendChild(row)
  table_header.style.cssText =
    'position: sticky; top: 0; background:white; z-index: 1;'

  $("<th style='width:100px ;'>Name</th>").appendTo(row)
  const days_owed_planned_header = document.createElement('th')
  days_owed_planned_header.innerHTML = 'Planned '
  days_owed_planned_header.setAttribute(
    'style',
    'writing-mode: vertical-lr; width: 65px; min-height: 60px;'
  )
  // days_owed_planned_header.setAttribute('class', 'has-tooltip-right');
  // days_owed_planned_header.setAttribute('data-tooltip', 'The number of days of R&R owed to you from Company. This gets calculated including all the future events that have not been commited.');
  $(days_owed_planned_header).appendTo(row)

  const days_owed_actual_header = document.createElement('th')
  days_owed_actual_header.setAttribute(
    'style',
    'width: 65px; min-height: 60px;'
  )
  days_owed_actual_header.innerHTML =
    "<p style='writing-mode: vertical-lr;'>Current</p>"
  days_owed_actual_header.setAttribute('class', 'has-tooltip-right')
  days_owed_actual_header.setAttribute(
    'data-tooltip',
    'The number of days of R&R owed to you from Company to this day. This only gets calculated up to today.'
  )
  $(days_owed_actual_header).appendTo(row)

  for (let i = 1; i <= numDays; i++) {
    const day = new Date(current_year, current_month, i)

    const day_name = day.toLocaleString('default', { weekday: 'short' })
    const cell = $(
      "<th style='padding:0; margin:0; min-width:35px; align-items: center;justify-content: center;' class = 'has-text-centered' >" +
        '<p>' +
        i +
        '</p>' +
        '<p>' +
        day_name +
        '</p>' +
        '</th>'
    )
    const day_index = day.getDay()
    if (day_index == 0 || day_index == 6) {
      cell.addClass('has-background-white-ter')
    }

    $(cell).appendTo(row)
  }
  // Highlight the current date
  if (
    current_month == today.getMonth() &&
    current_year == today.getFullYear()
  ) {
    $(row.cells[today.getDate() + 2]).addClass('has-background-warning-light')
    $(row.cells[today.getDate() + 2]).attr(
      'style',
      'padding:0; margin:0; min-width:35px; align-items: center;justify-content: center; border-right: 2px solid; border-left: 2px solid; border-top: 2px solid;'
    )
  }
}

/**
 * It removes the first child of the table header
 * @param name - The name of the table.
 */
function deleteTableHeader (name) {
  const table = document.getElementById('table_' + name)
  const table_header = document.getElementById('table_header_' + name)
  table_header.firstChild.remove()
}

/**
 * Create a table header element and append it to the table element with the given name.
 * @param name - the name of the table
 */
function createTableHeader (name) {
  const table = document.getElementById('table_' + name)
  const table_header = document.createElement('thead')
  table_header.setAttribute('id', 'table_header_' + name)
  table.appendChild(table_header)
}

/**
 * It deletes all the rows in a table
 * @param name - The name of the table.
 */
function deleteTableBody (name) {
  const table_body = document.getElementById('table_body_' + name)
  const nodes_length = table_body.childNodes.length
  const nodes = table_body.childNodes

  for (let i = nodes_length - 1; i >= 0; i--) {
    nodes[i].remove()
  }
}

/**
 * It creates a table body element and appends it to the table element with the id "table_" + name
 * @param name - The name of the table.
 */
function createTableBody (name) {
  const table = document.getElementById('table_' + name)
  const table_body = document.createElement('tbody')
  table_body.setAttribute('id', 'table_body_' + name)
  table_body.setAttribute('style', 'overflow-y: scroll; max-height: 800px;')
  table.appendChild(table_body)
}

/**
 * It creates a table with a header and a body
 * @param name - the name of the table
 * @param height - the height of the table
 * @param width - The width of the table.
 */
function createInitialTable (name, height, width) {
  const main_div = document.getElementById(name)

  const columns = document.createElement('div')
  columns.classList.add('columns')

  const column = document.createElement('div')
  column.classList.add('column')

  const table_container = document.createElement('div')
  // table_container.className = "table-container";
  table_container.setAttribute('id', 'table_container_' + name)
  table_container.style.cssText = 'height:' + height + 'px; width: 100%;'
  main_div.appendChild(table_container)

  const table = document.createElement('table')
  table.className =
    'table is-narrow has-sticky-header is-bordered is-striped is-hoverable is-fullwidth'
  table.setAttribute('id', 'table_' + name)
  table.setAttribute('style', 'word-wrap:break-word;table-layout: fixed;')
  table_container.appendChild(table)
  column.appendChild(table_container)
  columns.appendChild(column)
  main_div.appendChild(columns)
  createTableHeader(name)
  createTableBody(name)
}

function toTitleCase (str) {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  })
}

function creatDropDownSelectField (name, field, options, values) {
  const label_div = document.createElement('div')
  label_div.classList.add('field-label')
  const label = document.createElement('label')
  label.classList.add('label')
  label.innerHTML = field
  label_div.appendChild(label)

  const field_body_div = document.createElement('div')
  field_body_div.classList.add('field-body')

  const field_div = document.createElement('div')
  field_div.classList.add('field')

  const select = document.createElement('div')
  select.classList.add('control', 'is-expanded')

  const select_div = document.createElement('div')
  select_div.classList.add('select', 'is-fullwidth')
  select_div.setAttribute('style', 'min-width: 450px;')

  const select_options = document.createElement('select')

  select_options.id = field
  select_options.classList.add('select_field')

  if (field == 'User') {
    select_div.classList.add('is-multiple')
    select_options.setAttribute('multiple', '')
    select_options.setAttribute('size', '3')
  }

  const all_option = document.createElement('option')
  all_option.value = 'All'
  all_option.innerHTML = 'All'
  select_options.appendChild(all_option)

  for (let i = 0; i < options.length; i++) {
    const option = document.createElement('option')
    if (field == 'User') {
      option.value = values[i].id
      option.innerHTML = toTitleCase(
        values[i].first_name + ' ' + values[i].last_name
      )
    } else {
      option.value = values[i]
      if (field == 'Company') {
        option.innerHTML = options[i]
      } else {
        option.innerHTML = toTitleCase(options[i])
      }
    }

    select_options.appendChild(option)
  }

  if (field == 'Month') {
    select_options.value = current_month
  } else if (field == 'Year') {
    select_options.value = current_year
  }

  select_div.appendChild(select_options)
  select.appendChild(select_div)

  field_div.appendChild(label)
  field_div.appendChild(select)

  return field_div
}

function registerSelectChange (
  name,
  users,
  createFilter,
  createModal,
  is_potential_roster,
  is_review
) {
  // get all select class elements
  const select_fields = document.getElementsByClassName('select_field')

  // loop through all select elements
  for (let i = 0; i < select_fields.length; i++) {
    // add event listener to each select element
    select_fields[i].addEventListener('change', function () {
      const select = this
      // get the value of the selected option
      const select_id = select.id
      const select_value = select.value

      const select_field = select_id

      if (select_field == 'Type') {
        roster_type = select_value
      } else if (select_field == 'Status') {
        roster_status = select_value
      } else if (select_field == 'Country') {
        roster_country = select_value
      } else if (select_field == 'Month') {
        current_month = parseInt(select_value)
        timescale_changed = true
      } else if (select_field == 'Year') {
        current_year = parseInt(select_value)
        timescale_changed = true
      } else if (select_field == 'City') {
        roster_city = select_value
      } else if (select_field == 'Department') {
        roster_department = select_value
      } else if (select_field == 'Workgroup') {
        roster_workgroup = select_value
      } else if (select_field == 'Role') {
        roster_role = select_value
      } else if (select_field == 'User Type') {
        roster_user_type = select_value
      } else if (select_field == 'Roster Type') {
        roster_rotation_type = select_value
      } else if (select_field == 'Company') {
        roster_company = select_value
      } else if (select_field == 'Active Roster') {
        roster_active = select_value
      }

      updateRoster(
        name,
        users,
        createFilter,
        createModal,
        is_potential_roster,
        is_review
      )
    })
  }
}

/**
 * It creates a div with the class of columns, and then creates four divs with the class of column, and
 * then creates a dropdown select field for each of the four divs, and then appends the dropdown select
 * field to the div, and then appends the div to the columns div, and then returns the columns div
 * @param name - the name of the select field
 * @returns A div with the class of columns.
 */

async function createFilters (
  name,
  users,
  createFilter,
  createModal,
  is_potential_roster,
  is_review,
  countries,
  workgroups,
  departments,
  roles,
  roster_types,
  user_types,
  companies
) {
  const container = document.getElementById(name)

  const box = document.createElement('div')
  box.classList.add('box')
  const columns = document.createElement('div')
  columns.classList.add('field-body')

  const columns0 = document.createElement('div')
  columns0.classList.add('field-body')

  const columns1 = document.createElement('div')
  columns1.classList.add('field-body')

  const columns2 = document.createElement('div')
  columns2.classList.add('field-body')

  const columns3 = document.createElement('div')
  columns3.classList.add('field-body')

  const columns4 = document.createElement('div')
  columns4.classList.add('field-body')

  const columns5 = document.createElement('div')
  columns5.classList.add('field-body')

  //   var select_month = creatDropDownSelectField(name,
  //                                               "Month",
  //                                               ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  //                                               [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  // columns.appendChild(select_month);
  if (false) {
    const select_user = creatDropDownSelectField(name, 'User', users, users)
    columns.appendChild(select_user)
  }

  if (roster_types != null) {
    const select_roster_type = creatDropDownSelectField(
      name,
      'Roster Type',
      roster_types.names,
      roster_types.values
    )
    var column = document.createElement('div')
    column.classList.add('column', 'is-half')
    column.appendChild(select_roster_type)
    columns1.appendChild(column)
  }

  if (user_types != null) {
    const select_status = creatDropDownSelectField(
      name,
      'User Type',
      user_types.names,
      user_types.values
    )
    var column = document.createElement('div')
    column.classList.add('column', 'is-half')
    column.appendChild(select_status)
    columns1.appendChild(column)
  }

  // get counties
  if (countries != null) {
    const select_country = creatDropDownSelectField(
      name,
      'Country',
      countries.names,
      countries.values
    )
    var column = document.createElement('div')
    column.classList.add('column', 'is-half')
    column.appendChild(select_country)
    columns2.appendChild(column)
  }

  // get departments
  if (departments != null) {
    const select_department = creatDropDownSelectField(
      name,
      'Department',
      departments.names,
      departments.values
    )
    var column = document.createElement('div')
    column.classList.add('column', 'is-half')
    column.appendChild(select_department)
    columns2.appendChild(column)
  }

  // get workgroups
  if (workgroups != null) {
    const select_workgroup = creatDropDownSelectField(
      name,
      'Workgroup',
      workgroups.names,
      workgroups.values
    )
    var column = document.createElement('div')
    column.classList.add('column', 'is-half')
    column.appendChild(select_workgroup)
    columns3.appendChild(column)
  }

  // get roles
  if (roles != null) {
    const select_role = creatDropDownSelectField(
      name,
      'Role',
      roles.names,
      roles.values
    )
    var column = document.createElement('div')
    column.classList.add('column', 'is-half')
    column.appendChild(select_role)
    columns3.appendChild(column)
  }

  if (companies != null) {
    const select_company = creatDropDownSelectField(
      name,
      'Company',
      companies.names,
      companies.values
    )
    var column = document.createElement('div')
    column.classList.add('column', 'is-half')
    column.appendChild(select_company)
    columns4.appendChild(column)
  }

  const select_active_roster = creatDropDownSelectField(
    name,
    'Active Roster',
    ['Yes', 'No'],
    ['Yes', 'No']
  )
  var column = document.createElement('div')
  column.classList.add('column', 'is-half')
  column.appendChild(select_active_roster)
  columns4.appendChild(column)

  var column = document.createElement('div')
  column.classList.add('column', 'is-full')
  const search_label = document.createElement('label')
  search_label.classList.add('label')
  search_label.innerHTML = 'Search for a user'
  column.appendChild(search_label)

  const search_field_control = document.createElement('p')
  search_field_control.classList.add('control', 'has-icons-left')

  const search_icon = document.createElement('span')
  search_icon.classList.add('icon', 'is-small', 'is-left')
  const search_icon_img = document.createElement('i')
  search_icon_img.classList.add('fa-solid', 'fa-magnifying-glass')
  search_icon.appendChild(search_icon_img)

  const search_field = document.createElement('input')
  search_field.classList.add('input')
  search_field.setAttribute('type', 'text')
  search_field.setAttribute('placeholder', 'Search')
  search_field.setAttribute('id', 'search_field')
  search_field.addEventListener('keyup', function (event) {
    roster_search = search_field.value.toLowerCase()
    if (roster_search.lenght == 0) timescale_changed = true
    updateRoster(
      name,
      users,
      createFilter,
      createModal,
      is_potential_roster,
      is_review
    )
  })
  search_field_control.appendChild(search_field)
  search_field_control.appendChild(search_icon)
  column.appendChild(search_field_control)
  columns5.appendChild(column)

  box.appendChild(columns)
  box.appendChild(columns1)
  box.appendChild(columns2)
  box.appendChild(columns3)
  box.appendChild(columns4)
  box.appendChild(columns5)

  container.appendChild(box)

  registerSelectChange(
    name,
    users,
    createFilter,
    createModal,
    is_potential_roster,
    is_review
  )
}

/**
 * It creates the buttons that allow the user to change the month of the calendar
 * @param name - the name of the calendar
 * @param users - an array of user objects
 */
function createButtons (
  name,
  users,
  createFilter,
  createModal,
  is_potential_roster,
  is_review
) {
  const main_container = document.getElementById(name)
  const container = document.createElement('div')
  $(container).addClass('field has-addons')

  const control_prev = document.createElement('p')
  control_prev.className = 'control'
  const button_prev = document.createElement('button')
  button_prev.className = 'button'
  button_prev.setAttribute('id', 'prev_month_btn_' + name)
  container.appendChild(control_prev)
  control_prev.appendChild(button_prev)

  const icon_prev = document.createElement('span')
  icon_prev.className = 'icon is-small'

  const i_prev = document.createElement('i')
  i_prev.className = 'fa-solid fa-angle-left'
  icon_prev.appendChild(i_prev)
  $(icon_prev).appendTo(button_prev)

  const control_cur = document.createElement('p')
  control_cur.className = 'control'
  const button_cur = document.createElement('button')
  button_cur.className = 'button'
  button_cur.setAttribute('id', 'current_month_btn_' + name)
  container.appendChild(control_cur)
  control_cur.appendChild(button_cur)

  const button_hidden = document.createElement('button')
  button_hidden.className = 'button'
  button_hidden.classList.add('is-hidden')
  button_hidden.setAttribute('id', 'hidden_btn_' + name)
  container.appendChild(button_hidden)

  const icon_cur = document.createElement('span')
  icon_cur.className = 'icon is-small'

  const i_cur = document.createElement('i')
  i_cur.className = 'fa-solid fa-clock-rotate-left'
  icon_cur.appendChild(i_cur)

  $(icon_cur).appendTo(button_cur)

  const control_next = document.createElement('p')
  control_next.className = 'control'
  const button_next = document.createElement('button')
  button_next.className = 'button'
  button_next.setAttribute('id', 'next_month_btn_' + name)

  container.appendChild(control_next)
  control_next.appendChild(button_next)

  const icon_next = document.createElement('span')
  icon_next.className = 'icon is-small'

  const i_next = document.createElement('i')
  i_next.className = 'fa-solid fa-angle-right'
  icon_next.appendChild(i_next)

  $(icon_next).appendTo(button_next)

  button_prev.addEventListener('click', function () {
    deleteNotification()
    changeToPrevMonth(
      name,
      users,
      createFilter,
      createModal,
      is_potential_roster,
      is_review
    )
  })
  button_next.addEventListener('click', function () {
    deleteNotification()
    changeToNextMonth(
      name,
      users,
      createFilter,
      createModal,
      is_potential_roster,
      is_review
    )
  })
  button_cur.addEventListener('click', function () {
    deleteNotification()
    changeToCurrentMonth(
      name,
      users,
      createFilter,
      createModal,
      is_potential_roster,
      is_review
    )
  })

  button_hidden.addEventListener('click', function () {
    deleteNotification()
    updateRoster(
      name,
      users,
      createFilter,
      createModal,
      is_potential_roster,
      is_review
    )
  })

  const column = document.createElement('div')
  column.className = 'column is-2'
  column.appendChild(container)

  const columns = document.createElement('div')
  columns.className = 'columns'
  columns.classList.add('has-text-centered')
  main_container.appendChild(columns)
  columns.appendChild(column)

  createLabel(name, columns)
}

/**
 * It creates a label for the roster date
 * @param name - the name of the roster
 */

function createLabel (name, columns) {
  const column = document.createElement('div')
  column.className = 'column'
  columns.appendChild(column)

  const text = document.createElement('p')
  text.classList.add('title')

  text.classList.add('is-3')
  text

  // text.className = "has-text-link";
  text.setAttribute('id', 'roster_date_label_' + name)
  column.appendChild(text)

  setLabels(name)
}

/**
 * It sets the label for the date range of the roster
 * @param name - The name of the roster.
 */
function setLabels (name) {
  const label_range = document.getElementById('roster_date_label_' + name)
  const numDays = daysInMonth(current_month, current_year)
  const month = current_month
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ]
  label_range.innerHTML = monthNames[month] + ' ' + current_year
}

function createCell (
  d,
  today,
  year,
  month,
  last_roster,
  createModal,
  type,
  user,
  result
) {
  const $x = $('<td>', {
    class: 'has-text-centered'
  })

  if (
    today.getFullYear() == year &&
    today.getMonth() == month &&
    today.getDate() == d
  ) {
    if (last_roster) {
      $x.css({
        padding: '0',
        margin: '0',
        'min-height': '50px',
        width: '25px',
        'border-right': '2px solid',
        'border-left': '2px solid',
        'border-bottom': '2px solid'
      })
    } else {
      $x.css({
        padding: '0',
        margin: '0',
        'min-height': '50px',
        width: '25px',
        'border-right': '2px solid',
        'border-left': '2px solid'
      })
    }
  } else {
    $x.css({
      padding: '0',
      margin: '0',
      'min-height': '50px',
      width: '25px'
    })
  }

  if (createModal == true && type == 'planned') {
    $x.addClass('eventCell')
    $x.attr({
      'data-user-id': user.id,
      'data-year': year,
      'data-month': month,
      'data-date': d,
      'data-name': name,
      'data-num-events': 0,
      flight_id: -1
    })

    $x.on('click', function () {
      const user_id = $(this).attr('data-user-id')
      const year = $(this).attr('data-year')
      const month = $(this).attr('data-month')
      const date = $(this).attr('data-date')
      const name = $(this).attr('data-name')
      deleteNotification()
      openNewEventModal(user_id, year, month, date, name, this, result)
      console.log(
        'data-id: ' +
          $(this).attr('data-date') +
          ' num-events: ' +
          $(this).attr('data-num-events')
      )
    })
  }

  return $x
}

function pickTextColorBasedOnBgColorSimple (bgColor, lightColor, darkColor) {
  const color = bgColor.charAt(0) === '#' ? bgColor.substring(1, 7) : bgColor
  const r = parseInt(color.substring(0, 2), 16) // hexToR
  const g = parseInt(color.substring(2, 4), 16) // hexToG
  const b = parseInt(color.substring(4, 6), 16) // hexToB
  return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? darkColor : lightColor
}

function populateRosterRow (
  row,
  user,
  type,
  result,
  days_owed,
  days_owed_actual,
  month,
  year,
  createModal,
  name,
  offset,
  last_roster
) {
  const numDays = daysInMonth(current_month, current_year)

  if (days_owed != null) {
    $('<th  user-id="' + user.id + '">' + days_owed + '</th>').appendTo(row)
  } else {
    $('<th>' + 'X' + '</th>').appendTo(row)
  }

  if (days_owed_actual != null) {
    $('<th>' + days_owed_actual + '</th>').appendTo(row)
  } else {
    $('<th>' + 'X' + '</th>').appendTo(row)
  }

  const today = new Date()

  for (var d = 1; d <= numDays; d++) {
    const x = row.insertCell()
    const date = new Date(year, month, d)
    const day_index = date.getDay()
    if (day_index == 0 || day_index == 6) {
      x.classList.add('has-background-white-ter')
    }
    x.classList.add('has-text-centered')

    if (
      today.getFullYear() == year &&
      today.getMonth() == month &&
      today.getDate() == d
    ) {
      x.classList.remove('has-background-white-ter')
      x.classList.add('has-background-warning-light')
      if (last_roster) {
        x.setAttribute(
          'style',
          'padding: 0; margin:0; min-height: 50px; width:25px; border-right: 2px solid; border-left: 2px solid; border-bottom: 2px solid;'
        )
      } else {
        x.setAttribute(
          'style',
          ' padding: 0; margin:0; min-height: 50px; width:25px; border-right: 2px solid; border-left: 2px solid;'
        )
      }
    } else {
      x.setAttribute(
        'style',
        'padding: 0; margin:0; min-height: 50px; width:25px;'
      )
    }
    if (createModal == true && type == 'planned') {
      x.classList.add('eventCell')
      x.setAttribute('data-user-id', user.id)
      x.setAttribute('data-year', year)
      x.setAttribute('data-month', month)
      x.setAttribute('data-date', d)
      x.setAttribute('data-name', name)
      x.setAttribute('data-num-events', 0)
      x.setAttribute('flight_id', -1)

      x.addEventListener('click', function () {
        const user_id = this.getAttribute('data-user-id')
        const year = this.getAttribute('data-year')
        const month = this.getAttribute('data-month')
        const date = this.getAttribute('data-date')
        const name = this.getAttribute('data-name')
        deleteNotification()
        openNewEventModal(user_id, year, month, date, name, this, result)
      })
    }
  }

  result.sort(function (a, b) {
    return a.type.priority - b.type.priority
  })

  const num_items = result?.length || 0
  for (let i = 0; i < num_items; i++) {
    const event = result[i]
    const event_type = event.type
    let parsed = event.start.split('-')
    let start = new Date(parsed[2], parsed[1] - 1, parsed[0])
    parsed = event.end.split('-')
    let end = new Date(parsed[2], parsed[1] - 1, parsed[0])
    let index = 1
    const color = ''

    if (type == 'potential') {
      if (
        (start < new Date(year, month, 1) && end < new Date(year, month, 1)) ||
        (start > new Date(year, month, numDays) &&
          end > new Date(year, month, numDays))
      ) {
        continue
      }
    }

    if (start.getFullYear() < year) {
      var new_date = new Date(year, month, 1)
      index =
        Math.round(
          (new_date.getTime() - start.getTime()) / (3600 * 1000 * 24)
        ) + 1
      start = new Date(year, month - 1, 1)
    } else if (start.getMonth() < month) {
      var new_date = new Date(year, month, 1)
      index =
        Math.round(
          (new_date.getTime() - start.getTime()) / (3600 * 1000 * 24)
        ) + 1
      start = new Date(year, month - 1, 1)
    }

    if (end.getFullYear() > year) {
      if (current_month == 11) {
        end = new Date(year + 1, 0, 0)
      } else {
        end = new Date(year, current_month + 1, 0)
      }
    } else if (end.getMonth() > month) {
      end = new Date(year, month + 1, 0)
    }

    let d_in = 0
    var num_events = 0
    for (var d = start.getDate(); d <= end.getDate(); d++) {
      d_in = d + 2 - offset
      var num_events = parseInt(
        row.cells[d_in].getAttribute('data-num-events')
      )
      row.cells[d_in].setAttribute('data-num-events', num_events + 1)

      const text_color = pickTextColorBasedOnBgColorSimple(
        event_type.color,
        '#FFFFFF',
        '#000000'
      )

      const tag = $(
        "<span class='tag my-1 mx-0' style=' width:90%; background-color: " +
          event_type.color +
          '; color:' +
          text_color +
          ";'></span>"
      )
      tag.attr('event_id', event.id)

      tag.addClass('has-tooltip-arrow has-tooltipl-multiline')
      tag.attr(
        'data-tooltip',
        'Type: ' +
          event_type.name +
          '\nStart: ' +
          event.start +
          '\nEnd: ' +
          event.end +
          '\nDuration: ' +
          event.duration +
          '\nRotation: ' +
          event.rotation
      )

      if (event_type.show_icon == true && event_type.icon != '') {
        tag.append(
          "<span class='icon'><i class='" + event_type.icon + "'></i></span>"
        )
      } else tag.text(index)

      if (event.is_flight) {
        tag.attr(
          'style',
          tag
            .attr('style')
            .replace(
              'background-color: ' + event_type.color,
              'background-color: ' + event.color
            )
        )
        tag.attr(
          'style',
          tag
            .attr('style')
            .replace(
              'color: ' + text_color,
              'color: ' +
                pickTextColorBasedOnBgColorSimple(
                  event.color,
                  '#FFFFFF',
                  '#000000'
                )
            )
        )
        tag.attr(
          'data-tooltip',
          tag.attr('data-tooltip') +
            '\nOrigin: ' +
            event.origin +
            '\nDestination: ' +
            event.destination +
            '\nIs Inbound: ' +
            event.is_inbound +
            '\nIs Ad Hoc: ' +
            event.is_adhoc +
            '\nConfirmed: ' +
            event.confirmed +
            '\nStatus: ' +
            event.status.status
        )
        tag.empty()
        if (event.is_inbound) {
          tag.append(
            "<span class='icon'><i class='fa-solid fa-plane-arrival'></i></span>"
          )
        } else {
          tag.append(
            "<span class='icon'><i class='fa-solid fa-plane-departure'></i></span>"
          )
        }

        row.cells[d_in].setAttribute('flight_id', event.id)
      }

      row.cells[d_in].appendChild(tag[0])
      index += 1
    }
  }
}

/**
 * It takes in a bunch of parameters, creates a table, and populates it with data
 * @param name - the name of the table
 * @param month - the month you want to display
 * @param year - the year of the roster
 * @param result - the result of the query
 */

function createUserRoster (
  name,
  month,
  year,
  result,
  createModal,
  potential_roster,
  last_row = false
) {
  // getEvents(userID, month, year, is_actual)
  var createModal = createModal
  const table_body = document.getElementById('table_body_' + name)

  const user = result.user
  if (user == null) {
    return
  }
  const user_id = user.id
  const user_name = user.first_name + ' ' + user.last_name
  const days_owed_planned = Math.round(user.days_owed_planned * 100) / 100
  const days_owed_actual = Math.round(user.days_owed_actual * 100) / 100

  const name_cell = document.createElement('th')
  name_cell.setAttribute(
    'style',
    'width: 180px; overflow: hidden; text-overflow: ellipsis;white-space: nowrap; '
  )
  const link_to_user = document.createElement('a')
  link_to_user.setAttribute(
    'style',
    'width:180px%; overflow: hidden;text-overflow: ellipsis; white-space: nowrap;'
  )
  link_to_user.setAttribute('href', '/roster_page/' + user_id)
  link_to_user.innerHTML = user_name
  name_cell.appendChild(link_to_user)
  let offset = 0

  if (potential_roster != null) {
    const row_potential = document.createElement('tr')
    row_potential.setAttribute('id', 'row_potential_' + user_id)
    row_potential.setAttribute('style', 'height: 60px;')
    table_body.appendChild(row_potential)
    name_cell.setAttribute('rowspan', '2')
    row_potential.appendChild(name_cell)

    potential_days_owed = Math.round(potential_days_owed * 100) / 100

    populateRosterRow(
      row_potential,
      user,
      'potential',
      potential_roster,
      potential_days_owed,
      days_owed_actual,
      month,
      year,
      createModal,
      name,
      offset,
      false
    )
    offset = 1
  }

  if (roster_type == 'All' || roster_type == 'planned') {
    const row_planned = document.createElement('tr')
    row_planned.setAttribute('id', 'row_planned_' + user_id)
    row_planned.setAttribute('style', 'height: 60px;')
    table_body.appendChild(row_planned)

    if (potential_roster == null && roster_type == 'All') {
      name_cell.setAttribute('rowspan', '1')
      row_planned.appendChild(name_cell)
    } else if (roster_type == 'planned') {
      // name_cell.setAttribute("rowspan", "1");
      row_planned.appendChild(name_cell)
    }

    populateRosterRow(
      row_planned,
      user,
      'planned',
      result.planned_events,
      days_owed_planned,
      days_owed_actual,
      month,
      year,
      createModal,
      name,
      offset,
      last_row
    )
    if (potential_roster == null && roster_type == 'All') {
      offset = 1
    }
  }
}

function filterUsers (users) {
  const filtered = []
  let add = true

  if (users == null || users.length == 0) {
    return filtered
  }

  for (let i = 0; i < users.length; i++) {
    const user = users[i]
    add = true
    if (add == true && roster_status != 'All') {
      if (user.travel_status == roster_status) {
        add = true
      } else {
        add = false
      }
    }

    if (add == true && roster_country != 'All') {
      if (user.country == roster_country) {
        add = true
      } else {
        add = false
      }
    }

    if (add == true && roster_city != 'All') {
      if (user.city == roster_city) {
        add = true
      } else {
        add = false
      }
    }

    if (add == true && roster_department != 'All') {
      if (user.department == roster_department) {
        add = true
      } else {
        add = false
      }
    }

    if (add == true && roster_workgroup != 'All') {
      if (user.workgroup == roster_workgroup) {
        add = true
      } else {
        add = false
      }
    }

    if (add == true && roster_role != 'All') {
      if (user.role == roster_role) {
        add = true
      } else {
        add = false
      }
    }

    if (add == true && roster_manager != 'All') {
      if (user.supervisor == roster_manager) {
        add = true
      } else {
        add = false
      }
    }

    if (add == true && roster_rotation_type != 'All') {
      if (user.roster_type == roster_rotation_type) {
        add = true
      } else {
        add = false
      }
    }

    if (add == true && roster_user_type != 'All') {
      if (user.travel_status == roster_user_type) {
        add = true
      } else {
        add = false
      }
    }
    if (add == true && roster_company != 'All') {
      if (user.company == roster_company) {
        add = true
      } else {
        add = false
      }
    }

    if (add == true && roster_active != 'All') {
      if (user.roster != 'None' && roster_active == 'Yes') {
        add = true
      } else if (user.roster == 'None' && roster_active == 'No') {
        add = true
      } else {
        add = false
      }
    }

    if (add == true && roster_search != '') {
      if (
        user.full_name.toLowerCase().indexOf(roster_search.toLowerCase()) > -1
      ) {
        add = true
      } else {
        add = false
      }
    }

    if (add == true) {
      filtered.push(users[i])
    }
  }
  return filtered
}

function getUserFromList (user_id) {
  for (let i = 0; i < current_users.length; i++) {
    if (current_users[i].id == user_id) {
      return current_users[i]
    }
  }
  return null
}

async function getUsersEvents (users) {
  const events = []

  for (let i = 0; i < users.length; i++) {
    const user = users[i]
    const user_events = await getUserEvents(user.id)
    events.push(user_events)
  }

  return events
}

function matchEventToUser (user, events) {
  let result = {}
  if (user == null || events == null) {
    return result
  }
  for (let j = 0; j < events.length; j++) {
    const event = events[j]
    if (event.user_id == user.id) {
      result = {
        user,
        planned_events: event.planned_events,
        actual_events: event.actual_events
      }

      break
    }
  }

  return result
}

/**
 * It fetches the events for the current month and year for the given users, and then creates a table
 * row for each user
 * @param name - the name of the roster
 * @param users - array of user IDs
 */
function createRosterBody (
  name,
  users,
  createFilter,
  createModal,
  is_potential_roster,
  is_review
) {
  const table_body = document.getElementById('table_body_' + name)
  let filtered = users
  const events = []
  let potential_roster = null

  if (createFilter == true) {
    filtered = filterUsers(users)
  }

  if (is_review == true && workgroup_mates.length > 0) {
    filtered = filtered.concat(workgroup_mates)
  }

  if (timescale_changed == true) {
    setCurrentEvents(filtered)
    timescale_changed = false
  }

  if (is_potential_roster == true) {
    potential_roster = potential_events
  }

  for (let i = 0; i < filtered.length; i++) {
    const result = matchEventToUser(filtered[i], current_events)
    if (is_review == true && i > 0) {
      potential_roster = null
    }
    createUserRoster(
      name,
      current_month,
      current_year,
      result,
      createModal,
      potential_roster,
      i == filtered.length - 1
    )
  }

  // Show current user highlighted
  // $(table_body.rows[0].cells[0]).addClass("has-background-warning");
  // $(table_body.rows[0].cells[1]).addClass("has-background-warning");
  // $(table_body.rows[0].cells[2]).addClass("has-background-warning");
  // $(table_body.rows[1].cells[0]).addClass("has-background-warning");
  // $(table_body.rows[1].cells[1]).addClass("has-background-warning");
  // $(table_body.rows[1].cells[2]).addClass("has-background-warning");
}

function getAllEventsFromCell (cell) {
  const event_nodes = cell.childNodes
  const events = []
  for (let i = 0; i < event_nodes.length; i++) {
    events.push(event_nodes[i].getAttribute('event_id'))
  }
  return events
}

function resetDeleteSectionDropdown (name) {
  const select = document.getElementById('delete_select_' + name)
  while (select.firstChild) {
    select.removeChild(select.firstChild)
  }
  const dropdown_option = document.createElement('option')
  dropdown_option.value = '-1'
  dropdown_option.innerHTML = 'Select an Event'
  select.appendChild(dropdown_option)
}

function populateDropdownDeleteDiv (events_in_cell, all_events, name) {
  const select = document.getElementById('delete_select_' + name)
  resetDeleteSectionDropdown(name)
  for (let i = 0; i < events_in_cell.length; i++) {
    const option = document.createElement('option')
    const event = getEventByIdFromList(events_in_cell[i], all_events)
    option.value = events_in_cell[i]
    option.innerText = event.title
    select.appendChild(option)
  }
}

function populateDeleteEventDiv (cell, all_events, name) {
  const div = document.getElementById('delete_event_div')

  const events = getAllEventsFromCell(cell)
  populateDropdownDeleteDiv(events, all_events, name)
}

function populateFlightChangeDiv (event, user_id, year, month, date, name) {
  const user = getUserFromList(user_id)
  const start_select = document.getElementById(
    'request_roster_change_personal_roster'
  )
  const date_obj = new Date(year, month, date)
  start_select.value = date_obj.toISOString().slice(0, 10)

  const from_field = document.getElementById(
    'request_roster_change_from_personal_roster'
  )
  const to_field = document.getElementById(
    'request_roster_change_to_personal_roster'
  )

  const confirm_checkbox = document.getElementById(
    'request_roster_confirm_booking_personal_roster'
  )

  const button_hidden = document.getElementById('hidden_btn_potential_roster')
  if (event.origin != null && event.destination != null) {
    from_field.value = event.origin
    to_field.value = event.destination
  } else {
    if (event.is_inbound == true) {
      from_field.value = user.home_port
      to_field.value = user.site
    } else {
      from_field.value = user.site
      to_field.value = user.home_port
    }
  }

  button_hidden.click()
}

function populateNewEventDiv (user_id, year, month, date, name) {
  const start_select = document.getElementById(
    'new_event_modal_start_date_' + name
  )
  const end_select = document.getElementById(
    'new_event_modal_end_date_' + name
  )
  const departure_select = document.getElementById(
    'new_event_modal_flight_departure_date_' + name
  )
  const return_select = document.getElementById(
    'new_event_modal_flight_return_date_' + name
  )
  const parsed_date = new Date(year, month, date)

  start_select.value = parsed_date.toISOString().slice(0, 10)
  end_select.value = parsed_date.toISOString().slice(0, 10)
  departure_select.value = parsed_date.toISOString().slice(0, 10)
  return_select.value = parsed_date.toISOString().slice(0, 10)
}

function resetAdhocWarning () {
  const warning = document.getElementById('request_roster_adhoc_warning')
  warning.innerText = ''
  warning.classList.add('is-hidden')
  warning.classList.remove('is-danger')
  warning.classList.remove('is-success')
}

function populateAdhocWarning (type, warning_text) {
  const warning = document.getElementById('request_roster_adhoc_warning')
  warning.innerText = warning_text
  warning.classList.remove('is-hidden')
  if (type == 'success') {
    warning.classList.add('is-success')
  } else {
    warning.classList.add('is-danger')
  }
}

function openNewEventModal (user_id, year, month, date, name, cell, all_events) {
  // Open up the modal
  const modal = document.getElementById('new_event_modal_' + name)
  modal.classList.add('is-active')
  const new_event_tab = document.getElementById(
    'new_event_modal_create_section'
  )
  new_event_tab.click()
  const event_span = cell.firstChild
  let event_id = null

  if (event_span != null) {
    event_id = event_span.getAttribute('event_id')
  }

  if (cell.getAttribute('flight_id') != -1) {
    event_id = cell.getAttribute('flight_id')
    const event = getEventByIdFromList(event_id, all_events)
    if (event.eticket_id != null) {
      const tab = document.getElementById('travel_request_section')
      tab.classList.add('is-hidden')
    } else {
      // Expose the tab
      const tab = document.getElementById('travel_request_section')
      tab.classList.remove('is-hidden')
      tab.firstChild.click()
      // Change Travel Event Section
      populateFlightChangeDiv(event, user_id, year, month, date, name)
    }
  } else {
    const tab = document.getElementById('travel_request_section')
    tab.classList.add('is-hidden')
    const new_event_tab = document.getElementById(
      'new_event_modal_create_section'
    )
    new_event_tab.firstChild.click()
  }

  setTravelrequestsateVars(user_id, event_id)

  // Delete Event Section
  populateDeleteEventDiv(cell, all_events, name)
  // New Event Section
  populateNewEventDiv(user_id, year, month, date, name)
}

function createModalDeleteSection (div_delete, name) {
  const dropdown_field = document.createElement('div')
  dropdown_field.classList.add('field')
  const dropdown_control = document.createElement('div')
  dropdown_control.classList.add('select')
  const dropdown_select = document.createElement('select')
  dropdown_select.id = 'delete_select_' + name
  const dropdown_option = document.createElement('option')
  dropdown_option.value = '-1'
  dropdown_option.innerHTML = 'Select an Event'
  dropdown_select.appendChild(dropdown_option)
  dropdown_control.appendChild(dropdown_select)
  dropdown_field.appendChild(dropdown_control)
  div_delete.appendChild(dropdown_field)

  // Event to delete label
  const event_to_delete_name_field = document.createElement('div')
  event_to_delete_name_field.classList.add('field')
  const event_to_delete_name_label = document.createElement('label')
  event_to_delete_name_label.classList.add('label')
  event_to_delete_name_label.innerHTML = "Event's Title:"
  event_to_delete_name_field.appendChild(event_to_delete_name_label)
  event_to_delete_name_paragraph = document.createElement('p')
  event_to_delete_name_paragraph.classList.add(
    'title',
    'is-3',
    'has-text-link'
  )
  event_to_delete_name_paragraph.setAttribute('id', 'event_to_delete_name')
  event_to_delete_name_field.appendChild(event_to_delete_name_paragraph)
  div_delete.appendChild(event_to_delete_name_field)

  // Event to delete type
  const event_to_delete_type_field = document.createElement('div')
  event_to_delete_type_field.classList.add('field')
  const event_to_delete_type_label = document.createElement('label')
  event_to_delete_type_label.classList.add('label')
  event_to_delete_type_label.innerHTML = 'Event Type to delete:'
  event_to_delete_type_field.appendChild(event_to_delete_type_label)
  event_to_delete_type_paragraph = document.createElement('p')
  event_to_delete_type_paragraph.classList.add(
    'title',
    'is-3',
    'has-text-link'
  )
  event_to_delete_type_paragraph.setAttribute('id', 'event_to_delete_type')
  event_to_delete_type_field.appendChild(event_to_delete_type_paragraph)
  div_delete.appendChild(event_to_delete_type_field)

  // Event to delete start date
  const event_to_delete_start_date_field = document.createElement('div')
  event_to_delete_start_date_field.classList.add('field')
  const event_to_delete_start_date_label = document.createElement('label')
  event_to_delete_start_date_label.classList.add('label')
  event_to_delete_start_date_label.innerHTML = "Event's start date:"
  event_to_delete_start_date_field.appendChild(
    event_to_delete_start_date_label
  )
  event_to_delete_start_date_paragraph = document.createElement('p')
  event_to_delete_start_date_paragraph.classList.add(
    'title',
    'is-3',
    'has-text-link'
  )
  event_to_delete_start_date_paragraph.setAttribute(
    'id',
    'event_to_delete_start'
  )
  event_to_delete_start_date_field.appendChild(
    event_to_delete_start_date_paragraph
  )
  div_delete.appendChild(event_to_delete_start_date_field)

  // Event to delete end date
  const event_to_delete_end_date_field = document.createElement('div')
  event_to_delete_end_date_field.classList.add('field')
  const event_to_delete_end_date_label = document.createElement('label')
  event_to_delete_end_date_label.classList.add('label')
  event_to_delete_end_date_label.innerHTML = "Event's end date:"
  event_to_delete_end_date_field.appendChild(event_to_delete_end_date_label)
  event_to_delete_end_date_paragraph = document.createElement('p')
  event_to_delete_end_date_paragraph.classList.add(
    'title',
    'is-3',
    'has-text-link'
  )
  event_to_delete_end_date_paragraph.setAttribute('id', 'event_to_delete_end')
  event_to_delete_end_date_field.appendChild(
    event_to_delete_end_date_paragraph
  )
  div_delete.appendChild(event_to_delete_end_date_field)

  // Confirm Delete
  const confirm_delete_div = document.createElement('div')
  confirm_delete_div.classList.add('field', 'has-text-centered')
  const confirm_delete_label = document.createElement('label')
  confirm_delete_label.classList.add('checkbox')
  const confirm_delete_input = document.createElement('input')
  confirm_delete_input.setAttribute('type', 'checkbox')
  confirm_delete_input.setAttribute('name', 'confirm_delete')
  confirm_delete_input.setAttribute(
    'id',
    'new_event_modal_confirm_delete_' + name
  )
  confirm_delete_label.innerText = 'I agree that I want to delete this event'
  confirm_delete_label.appendChild(confirm_delete_input)
  confirm_delete_div.appendChild(confirm_delete_label)
  div_delete.appendChild(confirm_delete_div)

  // Delete Button
  const delete_div = document.createElement('div')
  delete_div.classList.add('field', 'has-text-centered')
  const delete_btn = document.createElement('button')
  delete_btn.classList.add('button', 'is-danger', 'is-light', 'is-medium')
  delete_btn.setAttribute('name', 'delete_btn')
  delete_btn.innerHTML = 'Delete'
  delete_div.appendChild(delete_btn)
  div_delete.appendChild(delete_div)

  delete_btn.addEventListener('click', function () {
    deleteNotification()
    if (confirm_delete_input.checked) {
      const event_id = dropdown_select.value
      DeleteEventRequest(user_id_clicked, event_id)
    }
  })

  dropdown_control.addEventListener('change', function () {
    const event_id = document.getElementById('delete_select_' + name).value
    if (event_id != '-1') {
      $.ajax({
        url: '/api/events/' + event_id,
        type: 'GET'
      }).done((data) => {
        const event = data
        event_to_delete_name_paragraph.innerHTML = event.title
        event_to_delete_type_paragraph.innerHTML = event.type.name
        event_to_delete_start_date_paragraph.innerHTML = event.start
        event_to_delete_end_date_paragraph.innerHTML = event.end
      })
    } else {
      event_to_delete_name_paragraph.innerHTML = ''
      event_to_delete_type_paragraph.innerHTML = ''
      event_to_delete_start_date_paragraph.innerHTML = ''
      event_to_delete_end_date_paragraph.innerHTML = ''
    }
  })
  return div_delete
}

function resetTravelrequestsateVars () {
  event_id_clicked = -1
  user_id_clicked = -1
  potential_events = []
  potential_days_owed = 0
}

function setTravelrequestsateVars (user_id, event_id) {
  event_id_clicked = event_id
  user_id_clicked = user_id
}

function createModalNewEventSection (div_new, name) {
  const cols = document.createElement('div')
  cols.classList.add('columns', 'is-centered')
  const col1 = document.createElement('div')
  col1.classList.add('column', 'is-half', 'is-centered')
  cols.appendChild(col1)
  // Event Type
  const ev_type_container = document.createElement('div')
  const event_type_div = document.createElement('div')
  event_type_div.className = 'select is-medium is-fullwidth'
  const event_type_label = document.createElement('label')
  event_type_label.className = 'label'
  event_type_label.innerHTML = 'Event Type'

  const event_type_select = document.createElement('select')
  event_type_select.setAttribute('id', 'event_type_select_' + name)
  event_type_select.setAttribute('name', 'event_type_select_' + name)
  for (let i = 0; i < event_type_options.length; i++) {
    const event_type_option = document.createElement('option')
    event_type_option.setAttribute('value', event_type_options[i].name)
    event_type_option.innerHTML = event_type_options[i].name
    event_type_option.setAttribute(
      'id',
      'event_type_option_' + name + '_' + event_type_options[i].id
    )
    event_type_select.appendChild(event_type_option)
  }
  ev_type_container.appendChild(event_type_label)
  event_type_div.appendChild(event_type_select)
  ev_type_container.appendChild(event_type_div)
  col1.appendChild(ev_type_container)

  // Start date
  const start_date_div = document.createElement('div')
  start_date_div.classList.add('field')
  const start_label = document.createElement('element')
  start_label.classList.add('label')
  start_label.innerHTML = "Event's start date:"
  const input_start_date = document.createElement('input')
  input_start_date.setAttribute('type', 'date')
  input_start_date.setAttribute('class', 'input is-medium')
  input_start_date.setAttribute('name', 'start_date')
  input_start_date.setAttribute('id', 'new_event_modal_start_date_' + name)
  start_date_div.appendChild(start_label)
  start_date_div.appendChild(input_start_date)
  col1.appendChild(start_date_div)

  // End date
  const end_date_div = document.createElement('div')
  end_date_div.classList.add('field')
  const end_label = document.createElement('element')
  end_label.classList.add('label')
  end_label.innerHTML = "Event's end date (inclusive):"
  const input_end_date = document.createElement('input')
  input_end_date.setAttribute('type', 'date')
  input_end_date.setAttribute('class', 'input is-medium')
  input_end_date.setAttribute('name', 'end_date')
  input_end_date.setAttribute('id', 'new_event_modal_end_date_' + name)
  end_date_div.appendChild(end_label)
  end_date_div.appendChild(input_end_date)
  col1.appendChild(end_date_div)

  // Flight switch
  const flight_switch_div = $('<div>').addClass('field')
  const flight_switch_input = $('<input>')
    .addClass('switch is-rounded is-outlined is-link')
    .attr('type', 'checkbox')
    .attr('id', 'new_event_modal_flight_switch_' + name)
  const flight_switch_label = $('<label>').attr(
    'for',
    'new_event_modal_flight_switch_' + name
  )
  flight_switch_label.text('Requires Additional Ad Hoc Travels?')
  flight_switch_div.append(flight_switch_input)
  flight_switch_div.append(flight_switch_label)
  col1.appendChild(flight_switch_div[0])

  // Flight switch
  const flight_round_trip_switch_div = $('<div>').addClass('field is-hidden')
  const flight_round_trip_switch_input = $('<input>')
    .addClass('switch is-rounded is-outlined is-link')
    .attr('type', 'checkbox')
    .attr('id', 'new_event_modal_flight_round_trip_switch_' + name)
    .attr('checked', 'checked')
  const flight_round_trip_switch_label = $('<label>').attr(
    'for',
    'new_event_modal_flight_round_trip_switch_' + name
  )
  flight_round_trip_switch_label.text('Round trip?')
  flight_round_trip_switch_div.append(flight_round_trip_switch_input)
  flight_round_trip_switch_div.append(flight_round_trip_switch_label)
  col1.appendChild(flight_round_trip_switch_div[0])

  const flights_div = $('<div>').addClass('columns is-hidden')
  const flight_departure_div = $('<div>').addClass('column is-half')
  const flight_return_div = $('<div>').addClass('column is-half')

  // Flight Departure box
  const flight_departure_box = $('<div>').addClass('box')
  const flight_departure_box_label = $('<label>')
    .addClass('label')
    .text('Departure Flight')
  flight_departure_box.append(flight_departure_box_label)

  const flight_departure_from = $('<div>').addClass('field')
  const flight_departure_from_label = $('<label>')
    .addClass('label')
    .text('From')
  const flight_departure_from_input = $('<input>')
    .addClass('input is-medium')
    .attr('type', 'text')
    .attr('name', 'flight_departure_from')
    .attr('id', 'new_event_modal_flight_departure_from_' + name)
  flight_departure_from.append(flight_departure_from_label)
  flight_departure_from.append(flight_departure_from_input)
  flight_departure_box.append(flight_departure_from)
  const flight_departure_to = $('<div>').addClass('field')
  const flight_departure_to_label = $('<label>').addClass('label').text('To')
  const flight_departure_to_input = $('<input>')
    .addClass('input is-medium')
    .attr('type', 'text')
    .attr('name', 'flight_departure_to')
    .attr('id', 'new_event_modal_flight_departure_to_' + name)
  flight_departure_to.append(flight_departure_to_label)
  flight_departure_to.append(flight_departure_to_input)
  flight_departure_box.append(flight_departure_to)
  const flight_departure_date = $('<div>').addClass('field')
  const flight_departure_date_label = $('<label>')
    .addClass('label')
    .text('Arrival Date')
  const flight_departure_date_input = $('<input>')
    .addClass('input is-medium')
    .attr('type', 'date')
    .attr('name', 'flight_departure_date')
    .attr('id', 'new_event_modal_flight_departure_date_' + name)
  flight_departure_date.append(flight_departure_date_label)
  flight_departure_date.append(flight_departure_date_input)
  flight_departure_box.append(flight_departure_date)
  flight_departure_div.append(flight_departure_box)
  flights_div.append(flight_departure_div)

  // Flight Return box
  const flight_return_box = $('<div>').addClass('box')
  const flight_return_box_label = $('<label>')
    .addClass('label')
    .text('Return Flight')
  flight_return_box.append(flight_return_box_label)

  const flight_return_from = $('<div>').addClass('field')
  const flight_return_from_label = $('<label>').addClass('label').text('From')
  const flight_return_from_input = $('<input>')
    .addClass('input is-medium')
    .attr('type', 'text')
    .attr('name', 'flight_return_from')
    .attr('id', 'new_event_modal_flight_return_from_' + name)
  flight_return_from.append(flight_return_from_label)
  flight_return_from.append(flight_return_from_input)
  flight_return_box.append(flight_return_from)
  const flight_return_to = $('<div>').addClass('field')
  const flight_return_to_label = $('<label>').addClass('label').text('To')
  const flight_return_to_input = $('<input>')
    .addClass('input is-medium')
    .attr('type', 'text')
    .attr('name', 'flight_return_to')
    .attr('id', 'new_event_modal_flight_return_to_' + name)
  flight_return_to.append(flight_return_to_label)
  flight_return_to.append(flight_return_to_input)
  flight_return_box.append(flight_return_to)
  const flight_return_date = $('<div>').addClass('field')
  const flight_return_date_label = $('<label>')
    .addClass('label')
    .text('Return Date')
  const flight_return_date_input = $('<input>')
    .addClass('input is-medium')
    .attr('type', 'date')
    .attr('name', 'flight_return_date')
    .attr('id', 'new_event_modal_flight_return_date_' + name)
  flight_return_date.append(flight_return_date_label)
  flight_return_date.append(flight_return_date_input)
  flight_return_box.append(flight_return_date)
  flight_return_div.append(flight_return_box)
  flights_div.append(flight_return_div)

  col1.appendChild(flights_div[0])

  flight_switch_input.on('change', function () {
    if ($(this).is(':checked')) {
      flights_div.removeClass('is-hidden')
      flight_round_trip_switch_div.removeClass('is-hidden')
      flight_switch_input.attr('checked', 'checked')
    } else {
      flights_div.addClass('is-hidden')
      flight_round_trip_switch_div.addClass('is-hidden')
      flight_switch_input.attr('checked', false)
    }
  })

  flight_round_trip_switch_input.on('change', function () {
    if ($(this).is(':checked')) {
      flight_return_box.removeClass('is-hidden')
      flight_round_trip_switch_input.attr('checked', 'checked')
    } else {
      flight_return_box.addClass('is-hidden')
      flight_round_trip_switch_input.attr('checked', false)
    }
  })

  // Submit button
  const submit_div = document.createElement('div')
  submit_div.classList.add('field', 'has-text-centered')
  const submit_btn = document.createElement('button')
  submit_btn.classList.add('button', 'is-link', 'is-medium')
  submit_btn.setAttribute('name', 'submit_btn')
  submit_btn.innerHTML = 'Submit'
  submit_div.appendChild(submit_btn)
  col1.appendChild(submit_div)

  submit_btn.addEventListener('click', function () {
    const start_date_array = input_start_date.value.split('-')
    const start_date = new Date(
      start_date_array[0],
      start_date_array[1] - 1,
      start_date_array[2]
    )

    const end_date_array = input_end_date.value.split('-')
    const end_date = new Date(
      end_date_array[0],
      end_date_array[1] - 1,
      end_date_array[2]
    )

    const dep_date_array = flight_departure_date_input.val().split('-')
    const dep_date = new Date(
      dep_date_array[0],
      dep_date_array[1] - 1,
      dep_date_array[2]
    )

    const ret_date_array = flight_return_date_input.val().split('-')
    const ret_date = new Date(
      ret_date_array[0],
      ret_date_array[1] - 1,
      ret_date_array[2]
    )

    if (document.getElementById('event_type_select_' + name).value == '') {
      createNotification('Please select an event type', 'error')
      return
    }

    if (flight_switch_input.is(':checked')) {
      if (
        flight_departure_from_input.val() == '' ||
        flight_departure_to_input.val() == '' ||
        flight_departure_date_input.val() == ''
      ) {
        createNotification(
          'Please fill in all the fields for the flight',
          'error'
        )
        return
      }
      if (flight_round_trip_switch_input.is(':checked')) {
        if (
          flight_return_from_input.val() == '' ||
          flight_return_to_input.val() == '' ||
          flight_return_date_input.val() == ''
        ) {
          createNotification(
            'Please fill in all the return fields for the flight',
            'error'
          )
          return
        }
      }
    }

    deleteNotification()
    postNewEventRequest(
      (user_id_clicked = user_id_clicked),
      (event_id_clicked = event_id_clicked),
      (start = start_date.toLocaleDateString('en-GB')),
      (end = end_date.toLocaleDateString('en-GB')),
      (event_type = document.getElementById('event_type_select_' + name).value),
      (travel_required = flight_switch_input.is(':checked')),
      (round_trip = flight_round_trip_switch_input.is(':checked')),
      (departure_from = flight_departure_from_input.val()),
      (departure_to = flight_departure_to_input.val()),
      (departure_date = dep_date.toLocaleDateString('en-GB')),
      (arrival_from = flight_return_from_input.val()),
      (arrival_to = flight_return_to_input.val()),
      (arrival_date = ret_date.toLocaleDateString('en-GB'))
    )
  })
  div_new.appendChild(cols)
  return div_new
}

function createFlightRequestBox (box_name, label_name) {
  const box_1 = document.createElement('div')
  box_1.classList.add('box')

  const label_cols = document.createElement('div')
  label_cols.classList.add('columns')
  const label_col = document.createElement('div')
  label_col.classList.add('column')
  const label = document.createElement('p')
  label.classList.add('title', 'is-3')
  label.innerHTML = label_name
  label_col.appendChild(label)
  label_cols.appendChild(label_col)
  box_1.appendChild(label_cols)

  // Origin Column
  const origin_cols = document.createElement('div')
  origin_cols.classList.add('columns')
  const origin_column = document.createElement('div')
  origin_column.classList.add('column')
  origin_cols.appendChild(origin_column)
  const origin_label = document.createElement('label')
  origin_label.classList.add('label')
  origin_label.innerText = 'Origin'
  const origin_input = document.createElement('input')
  origin_input.classList.add('input')
  origin_input.id = 'request_roster_change_from_personal_roster_' + box_name
  origin_input.type = 'text'
  origin_column.appendChild(origin_label)
  origin_column.appendChild(origin_input)
  origin_cols.appendChild(origin_column)
  box_1.appendChild(origin_cols)

  const destination_cols = document.createElement('div')
  destination_cols.classList.add('columns')
  const destination_column = document.createElement('div')
  destination_column.classList.add('column')
  destination_cols.appendChild(destination_column)
  const destination_label = document.createElement('label')
  destination_label.classList.add('label')
  destination_label.innerText = 'Destination'
  const destination_input = document.createElement('input')
  destination_input.classList.add('input')
  destination_input.id = 'request_roster_change_to_personal_roster_' + box_name
  destination_input.type = 'text'
  destination_column.appendChild(destination_label)
  destination_column.appendChild(destination_input)
  box_1.appendChild(destination_cols)

  const departure_date_cols = document.createElement('div')
  departure_date_cols.classList.add('columns')
  const dep_date_col = document.createElement('div')
  dep_date_col.classList.add('column')
  const dep_date_label = document.createElement('label')
  dep_date_label.classList.add('label')
  dep_date_label.innerText = 'Departure Date'
  const dep_date_input = document.createElement('input')
  dep_date_input.classList.add('input')
  dep_date_input.id = 'request_roster_change_departure_date_' + box_name
  dep_date_input.type = 'date'
  dep_date_col.appendChild(dep_date_label)
  dep_date_col.appendChild(dep_date_input)
  departure_date_cols.appendChild(dep_date_col)
  box_1.appendChild(departure_date_cols)

  return box_1
}

function createModalAdhocSection (div_adhoc, name) {
  const cols_header = document.createElement('div')
  cols_header.classList.add('columns')
  const col_header = document.createElement('div')
  col_header.classList.add('column')
  // var notification_header = document.createElement('div');
  // notification_header.classList.add('notification', 'is-danger', 'has-text-centered');
  // notification_header.setAttribute('style', 'width: 100%;');
  // notification_header.innerText = 'Currently is disabled: Ad Hoc flights are intended for unplanned flights outside of normal expatriate rosters for events such as training, or visits to head office. To modify a travel event that is part of your normal roster, please go to Travel Change tab.';

  // col_header.appendChild(notification_header);
  cols_header.appendChild(col_header)
  div_adhoc.appendChild(cols_header)

  // Warning box
  const cols_0 = document.createElement('div')
  cols_0.classList.add('columns')
  const col_0 = document.createElement('div')
  col_0.classList.add('column')
  const warning_box = document.createElement('div')
  warning_box.classList.add(
    'notification',
    'is-warning',
    'is-hidden',
    'has-text-centered'
  )
  warning_box.id = 'request_roster_adhoc_warning'
  col_0.appendChild(warning_box)
  cols_0.appendChild(col_0)
  div_adhoc.appendChild(cols_0)

  const cols_1 = document.createElement('div')
  cols_1.classList.add('columns')
  const col_1 = document.createElement('div')
  col_1.classList.add('column', 'is-half')
  col_1.appendChild(createFlightRequestBox('inbound', 'Flight'))
  cols_1.appendChild(col_1)
  const col_2 = document.createElement('div')
  col_2.classList.add('column')
  col_2.appendChild(createFlightRequestBox('outbound', 'Return Flight'))
  cols_1.appendChild(col_2)
  div_adhoc.appendChild(cols_1)
  const cols_3 = document.createElement('div')
  cols_3.classList.add('columns')
  const col_3 = document.createElement('div')
  col_3.classList.add('column')
  const submit_btn = document.createElement('button')
  submit_btn.classList.add('button', 'is-link', 'is-medium')
  submit_btn.innerText = 'Submit'
  submit_btn.id = 'request_roster_adhoc_submit'
  submit_btn.addEventListener('click', function () {
    const user_id = this.getAttribute('user_id')
    const from_field_in = document.getElementById(
      'request_roster_change_from_personal_roster_inbound'
    )
    const from_field_out = document.getElementById(
      'request_roster_change_from_personal_roster_outbound'
    )
    const to_field_in = document.getElementById(
      'request_roster_change_to_personal_roster_inbound'
    )
    const to_field_out = document.getElementById(
      'request_roster_change_to_personal_roster_outbound'
    )
    const from_date_in = document.getElementById(
      'request_roster_change_departure_date_inbound'
    )
    const from_date_out = document.getElementById(
      'request_roster_change_departure_date_outbound'
    )
    const warning_box = document.getElementById('request_roster_adhoc_warning')

    if (
      from_field_in.value == '' ||
      to_field_in.value == '' ||
      from_date_in == ''
    ) {
      resetAdhocWarning()
      populateAdhocWarning('warning', 'Please fill in desired flight details')
      return
    }
    if (
      from_field_out.value == '' ||
      to_field_out.value == '' ||
      from_date_out == ''
    ) {
      if (
        confirm(
          'You have not filled in the return flight details. Are you sure you want to submit?'
        ) == false
      ) {
        return
      }
    }
    $.ajax({
      url: '/travel/request_adhoc_itinerary/',
      type: 'POST',
      data: {
        inbound_departure_date: from_date_in.value,
        inbound_from: from_field_in.value,
        inbound_to: to_field_in.value,
        outbound_departure_date: from_date_out.value,
        outbound_from: from_field_out.value,
        outbound_to: to_field_out.value,
        user_id
      }
    }).done(function (data) {
      if (data.success) {
        resetAdhocWarning()
        populateAdhocWarning('success', data.message)

        setTimeout(function () {
          window.location.reload()
        }, 500)
      } else {
        populateAdhocWarning('warning', data.error)
      }
    })
  })
  col_3.appendChild(submit_btn)
  cols_3.appendChild(col_3)
  div_adhoc.appendChild(cols_3)

  return div_adhoc
}

function createTravelChangeRequestSection (
  div_travel,
  users,
  name,
  potential_roster_name
) {
  // Start date
  const cols_0 = document.createElement('div')
  cols_0.classList.add('columns', 'is-centered')
  const cols_1 = document.createElement('div')
  cols_1.classList.add('columns', 'is-centered', 'box')
  const col_0 = document.createElement('div')
  col_0.classList.add('column', 'is-half', 'is-centered')
  cols_0.appendChild(col_0)

  const col_1 = document.createElement('div')
  col_1.classList.add('column', 'is-full', 'is-centered')
  cols_1.appendChild(col_1)

  // Label for Travel Request
  const label_travel_header_div = document.createElement('div')
  label_travel_header_div.classList.add('field', 'has-text-centered')
  const label_travel_header = document.createElement('label')
  label_travel_header.classList.add('label', 'is-medium')
  label_travel_header.innerHTML = 'Travel Request'
  label_travel_header_div.appendChild(label_travel_header)
  col_0.appendChild(label_travel_header_div)

  const group_field = document.createElement('div')
  group_field.classList.add(
    'field',
    'is-grouped',
    'is-horizontal',
    'is-grouped-centered'
  )

  const start_date_div = document.createElement('div')
  start_date_div.classList.add('field', 'is-centered')
  start_date_div.setAttribute('style', 'width: 100%')
  const start_label = document.createElement('element')
  start_label.classList.add('label')
  start_label.innerHTML = "Event's start date:"
  const input_start_date = document.createElement('input')
  input_start_date.setAttribute('type', 'date')
  input_start_date.setAttribute('class', 'input is-medium')
  input_start_date.setAttribute('name', 'start_date')
  input_start_date.setAttribute('id', 'request_roster_change_' + name)
  start_date_div.appendChild(start_label)
  start_date_div.appendChild(input_start_date)

  group_field.appendChild(start_date_div)

  input_start_date.addEventListener('change', function () {
    const start_date = input_start_date.value
    const start_date_array = start_date.split('-')
    const is_projected = input_is_projected.checked

    const date = new Date(
      start_date_array[0],
      start_date_array[1] - 1,
      start_date_array[2]
    )
    getPotentialEventsJSON(
      user_id_clicked,
      event_id_clicked,
      date.toLocaleDateString('en-GB'),
      is_projected
    )
    timescale_changed = true
    updateRoster(potential_cal_name, users, false, false, true, false)
  })

  // Select is_projected Field
  const is_projected_div = document.createElement('div')
  is_projected_div.classList.add('field', 'is-fullwidth')
  is_projected_div.setAttribute('style', 'width: 100%')
  const is_projected_label = document.createElement('element')
  is_projected_label.classList.add('label')
  is_projected_label.innerHTML = 'Is Projected?'
  var input_is_projected = document.createElement('input')
  input_is_projected.setAttribute('type', 'checkbox')
  input_is_projected.setAttribute('name', 'is_projected')
  input_is_projected.setAttribute('id', 'request_roster_project_' + name)
  is_projected_div.appendChild(is_projected_label)
  is_projected_div.appendChild(input_is_projected)

  group_field.appendChild(is_projected_div)
  col_0.appendChild(group_field)

  const group_from_to_field = document.createElement('div')
  group_from_to_field.classList.add(
    'field',
    'is-grouped',
    'is-horizontal',
    'is-grouped-centered',
    'field-body'
  )

  // Origin Field
  const from_div = document.createElement('div')
  from_div.classList.add('field')
  from_div.classList.add('field', 'is-centered')
  from_div.setAttribute('style', 'width: 100%')
  const from_label = document.createElement('element')
  from_label.classList.add('label')
  from_label.innerHTML = 'From:'
  const input_from = document.createElement('input')
  input_from.setAttribute('type', 'text')
  input_from.setAttribute('name', 'from')
  input_from.setAttribute('class', 'input is-medium')
  input_from.setAttribute('id', 'request_roster_change_from_' + name)
  from_div.appendChild(from_label)
  from_div.appendChild(input_from)
  group_from_to_field.appendChild(from_div)

  // Destination Field
  const to_div = document.createElement('div')
  to_div.classList.add('field')
  to_div.classList.add('field', 'is-centered')
  to_div.setAttribute('style', 'width: 100%')
  const to_label = document.createElement('element')
  to_label.classList.add('label')
  to_label.innerHTML = 'To:'
  const input_to = document.createElement('input')
  input_to.setAttribute('type', 'text')
  input_to.setAttribute('name', 'to')
  input_to.setAttribute('class', 'input is-medium')
  input_to.setAttribute('id', 'request_roster_change_to_' + name)
  to_div.appendChild(to_label)
  to_div.appendChild(input_to)
  group_from_to_field.appendChild(to_div)

  col_0.appendChild(group_from_to_field)

  // Comment
  const comment_div = document.createElement('div')
  comment_div.classList.add('field')
  const comment_label = document.createElement('element')
  comment_label.classList.add('label')
  comment_label.innerHTML = 'Reason for change: '
  const input_comment = document.createElement('textarea')
  input_comment.classList.add('textarea')
  input_comment.setAttribute('name', 'comment')
  input_comment.setAttribute('id', 'request_roster_change_comment_' + name)
  comment_div.appendChild(comment_label)
  comment_div.appendChild(input_comment)
  col_0.appendChild(comment_div)

  input_is_projected.addEventListener('change', function () {
    const is_projected = input_is_projected.checked
    if (input_start_date.value == '') return
    const start_date = input_start_date.value
    const start_date_array = start_date.split('-')
    const date = new Date(
      start_date_array[0],
      start_date_array[1] - 1,
      start_date_array[2]
    )
    getPotentialEventsJSON(
      user_id_clicked,
      event_id_clicked,
      date.toLocaleDateString('en-GB'),
      is_projected
    )
    timescale_changed = true
    updateRoster(potential_cal_name, users, false, false, true)
  })

  const roster_div = document.createElement('div')
  roster_div.classList.add('field')
  const roster_label = document.createElement('element')
  roster_label.classList.add('label')
  roster_label.innerHTML = 'Planned Roster:'
  roster_div.setAttribute('id', potential_roster_name)

  const group_div_1 = document.createElement('div')
  group_div_1.classList.add('field', 'is-grouped')

  const submit_div = document.createElement('div')
  submit_div.classList.add('field', 'has-text-centered')
  submit_div.setAttribute('style', 'width: 100%; margin-bottom: 25px;')
  const submit_btn = document.createElement('button')
  submit_btn.classList.add('button', 'is-link', 'is-medium')
  submit_btn.setAttribute('name', 'submit_btn')
  submit_btn.innerHTML = 'Submit'
  submit_div.appendChild(submit_btn)
  group_div_1.appendChild(submit_div)

  submit_btn.addEventListener('click', function () {
    const is_projected = input_is_projected.checked
    if (input_start_date.value == '') return

    const confirm_booking = confirm(
      'Do you want to send this request for booking with the Travel Team?'
    )
    const start_date = input_start_date.value
    const start_date_array = start_date.split('-')
    const date = new Date(
      start_date_array[0],
      start_date_array[1] - 1,
      start_date_array[2]
    )
    const from = input_from.value
    const to = input_to.value
    const comment = input_comment.value
    deleteNotification()
    postRosterChangeRequest(
      user_id_clicked,
      event_id_clicked,
      date.toLocaleDateString('en-GB'),
      is_projected,
      from,
      to,
      comment,
      confirm_booking
    )
  })

  col_0.appendChild(group_div_1)

  col_1.appendChild(roster_div)
  div_travel.appendChild(cols_0)
  div_travel.appendChild(cols_1)
  return div_travel
}

function createPotentialRoster (potential_roster_name, users, name) {
  const height = users.length * 300
  createCalendar(
    potential_roster_name,
    users,
    1600,
    height,
    false,
    false,
    true,
    false
  )
}

function createNewEventModal (
  name,
  users,
  createFilter,
  createModal,
  is_potential_roster,
  is_review,
  potential_roster_name
) {
  const container = document.getElementById(name)
  const modal = document.createElement('div')
  modal.className = 'modal is-clipped'
  modal.setAttribute('id', 'new_event_modal_' + name)

  container.appendChild(modal)

  // New event section
  let div_new = document.createElement('div')
  div_new.setAttribute('id', 'new_event_div')
  div_new.classList.add('box', 'has-background-link-light')

  // Delete event section
  let div_delete = document.createElement('div')
  div_delete.setAttribute('id', 'delete_event_div')
  div_delete.classList.add(
    'is-hidden',
    'box',
    'has-background-link-light',
    'has-text-centered'
  )

  // New Adhoc flight request
  //   var div_adhoc = document.createElement("div");
  //   div_adhoc.setAttribute('id','adhoc_flight_div');
  //   div_adhoc.classList.add("is-hidden", 'box', 'has-background-link-light', 'has-text-centered');

  // Travel request section
  let div_travel = document.createElement('div')
  div_travel.setAttribute('id', 'travel_request_div')
  div_travel.classList.add(
    'is-hidden',
    'box',
    'has-background-link-light',
    'has-text-centered'
  )

  const modal_background = document.createElement('div')
  modal_background.className = 'modal-background'
  modal_background.setAttribute('id', 'new_event_modal_background_' + name)

  modal.appendChild(modal_background)

  const modal_card = document.createElement('div')
  modal_card.className = 'modal-card'
  modal_card.setAttribute('id', 'new_event_modal' + name)
  modal_card.setAttribute('style', 'min-width: 80%; min-height: 500px')

  modal.appendChild(modal_card)

  const modal_card_header = document.createElement('header')
  modal_card_header.className = 'modal-card-head'
  const modal_card_header_title = document.createElement('p')
  modal_card_header_title.className = 'modal-card-title'

  const delete_button = document.createElement('button')
  delete_button.className = 'delete_button'
  delete_button.setAttribute('id', 'new_event_modal_delete_button_' + name)
  delete_button.setAttribute('aria-label', 'close')

  const modal_card_body = document.createElement('section')
  modal_card_body.className = 'modal-card-body has-text-black'

  const modal_card_footer = document.createElement('footer')
  modal_card_footer.className = 'modal-card-foot'

  const notification_div = document.createElement('div')
  notification_div.setAttribute('id', 'new_event_modal_notification')

  // Tabs section
  const tabs = document.createElement('div')
  tabs.className = 'tabs is-medium is-toggle is-centered'
  tabs.setAttribute('id', 'new_event_modal_tabs_' + name)
  const tabs_ul = document.createElement('ul')
  const sections = [
    'Request travel change',
    'Request a non-roster event/travel',
    'Request event deletion'
  ]
  const sec_ids = [
    'travel_request_section',
    'new_event_modal_create_section',
    'new_event_modal_delete_section'
  ]

  for (let i = 0; i < sections.length; i++) {
    const tab_li = document.createElement('li')
    tab_li.setAttribute('id', sec_ids[i])
    tab_li.setAttribute('li_id', i)
    tab_li.className = 'tab_li'
    const tab_a = document.createElement('a')
    tab_a.setAttribute('li_id', i)
    tab_a.setAttribute('id', 'new_event_modal_tab_' + i)
    tab_a.innerHTML = sections[i]
    if (sec_ids[i] == 'new_event_modal_create_section') {
      tab_li.classList.add('is-active')
    }

    tab_li.appendChild(tab_a)
    tabs_ul.appendChild(tab_li)
    tab_a.addEventListener('click', function (e) {
      const tab_li = e.target.parentNode
      const tabs = document.getElementsByClassName('tab_li')
      deleteNotification()
      for (let i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove('is-active')
      }

      tab_li.classList.add('is-active')
      const tab_id = tab_li.getAttribute('id')
      if (tab_id == 'new_event_modal_create_section') {
        div_new.classList.remove('is-hidden')
        div_delete.classList.add('is-hidden')
        // div_adhoc.classList.add("is-hidden");
        div_travel.classList.add('is-hidden')
      } else if (tab_id == 'new_event_modal_delete_section') {
        div_new.classList.add('is-hidden')
        div_delete.classList.remove('is-hidden')
        // div_adhoc.classList.add("is-hidden");
        div_travel.classList.add('is-hidden')
      } else if (tab_id == 'travel_request_section') {
        div_new.classList.add('is-hidden')
        div_delete.classList.add('is-hidden')
        // div_adhoc.classList.add("is-hidden");
        div_travel.classList.remove('is-hidden')
      }
    })
  }
  tabs.appendChild(tabs_ul)
  modal_card_body.appendChild(tabs)
  modal_card_body.appendChild(notification_div)
  div_new = createModalNewEventSection(div_new, name)
  modal_card_body.appendChild(div_new)
  div_delete = createModalDeleteSection(div_delete, name)
  modal_card_body.appendChild(div_delete)
  //   div_adhoc = createModalAdhocSection(div_adhoc, name);
  //   modal_card_body.appendChild(div_adhoc);
  div_travel = createTravelChangeRequestSection(
    div_travel,
    users,
    name,
    potential_roster_name
  )
  modal_card_body.appendChild(div_travel)

  modal_card_header.appendChild(modal_card_header_title)
  modal_card_header.appendChild(delete_button)

  modal_card.appendChild(modal_card_header)
  modal_card.appendChild(modal_card_body)
  modal_card.appendChild(modal_card_footer)

  createPotentialRoster(potential_roster_name, users, name)

  modal_background.addEventListener('click', () => {
    modal.classList.remove('is-active')
    deleteNotification()
    resetTravelrequestsateVars()
  })

  delete_button.addEventListener('click', () => {
    modal.classList.remove('is-active')
    deleteNotification()
    resetTravelrequestsateVars()
  })
}

function assignCurrentUsers (users) {
  current_users = users
}

function setCurrentDate () {
  const today = new Date()
  current_month = today.getMonth()
  current_year = today.getFullYear()
}

function setCurrentEvents (users) {
  fetchEventsJSON(users, current_month, current_year)

  console.log(current_events)
}

/**
 * This function creates a calendar with the given name, users, width, and height.
 * @param name - the name of the calendar
 * @param users - an array of users, each user is an object with the following properties:
 * @param [width=100] - the width of the calendar
 * @param [height=500] - the height of the calendar
 */

function createCalendar (
  name,
  users,
  width = 1600,
  height = 500,
  createFilter = true,
  createModal = true,
  is_potential_roster = false,
  potential_roster_name = 'potential_roster',
  is_review = false,
  countries = null,
  workgroups = null,
  departments = null,
  roles = null,
  roster_types = null,
  user_types = null,
  companies = null
) {
  if (current_year == 0) {
    setCurrentDate()
  }
  assignCurrentUsers(users)

  timescale_changed = true
  if (createFilter == true) {
    createFilters(
      name,
      users,
      createFilter,
      createModal,
      is_potential_roster,
      is_review,
      countries,
      workgroups,
      departments,
      roles,
      roster_types,
      user_types,
      companies
    )
  }

  createButtons(
    name,
    users,
    createFilter,
    createModal,
    is_potential_roster,
    is_review
  )

  createInitialTable(name, height, width)

  if (is_review == true) {
    getWorgroupUsers(users)
  }

  createRosterBody(
    name,
    users,
    createFilter,
    createModal,
    is_potential_roster,
    is_review
  )
  if (createModal == true) {
    potential_cal_name = potential_roster_name
    getEventTypes()
    createNewEventModal(
      name,
      users,
      createFilter,
      createModal,
      is_potential_roster,
      is_review,
      potential_roster_name
    )
  }
  populateTableHeader(name)

  $('td, th').addClass('is-size-7')
}
