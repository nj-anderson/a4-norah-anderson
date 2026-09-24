// FRONT-END (CLIENT) JAVASCRIPT HERE

let groceryList = [];

const submit = async function( event ) {
  // stop form submission from trying to load
  // a new .html page for displaying results...
  // this was the original browser behavior and still
  // remains to this day
  event.preventDefault()


  // looks through the HTML for an element with the id of 'yourname'
  const item = document.querySelector( '#item' )
  const quantity = document.querySelector( '#quantity' )
  const is_purchased = document.querySelector( '#is_purchased' )

  const json = {
    item: item.value,
    quantity: quantity.value,
    is_purchased: is_purchased.checked
  }

  const body = JSON.stringify( json )


  // send request to server
  const response = await fetch( '/submit', {
    method:'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body
  })

  // waits for response from server
  const text = await response.text()
  //console.log( 'text:', text )

  // update the grocery list
  groceryList = JSON.parse( text )
  console.log("\n Current list: ", groceryList )

  //render the lists
  renderLists()

}

const renderLists = function() {

  // create the HTML for the list
  const shopping_list_to_buy_items = document.querySelector('#shopping-list-to-buy-items')
  shopping_list_to_buy_items.innerHTML = '' // clear the list

  const shopping_list_purchased_items = document.querySelector('#shopping-list-purchased-items')
  shopping_list_purchased_items.innerHTML = '' // clear the list

  // loop through the grocery list and create HTML elements for each item - sorted by purchased status
  for (const item of groceryList) {
    const to_buy_li = document.createElement('li')
    const purchased_li = document.createElement('li')

    to_buy_li.classList.add('grocery-item')
    purchased_li.classList.add('grocery-item')

    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.checked = item.is_purchased

    const delete_button = document.createElement('button')
    delete_button.innerHTML = '<i class="bi bi-trash"></i>'
    delete_button.id = 'delete-button'
    delete_button.setAttribute('aria-label', 'Delete grocery item')

    // listen for changes to the checkboxes
    checkbox.addEventListener('change', async function() {
      console.log(checkbox.checked)

      const update = {
        id: item.id,
        is_purchased: checkbox.checked
      }

      const body = JSON.stringify(update)

      const response = await fetch('/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body
      })

      const text = await response.text()
      groceryList = JSON.parse(text)
      renderLists()

    })

    // listen for clicks on the delete buttons
    delete_button.addEventListener('click', async function() {
      console.log(item.id + ' was deleted')

      const update = {
        id: item.id
      }

      const body = JSON.stringify(update)

      const response = await fetch('/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body
      })

      const text = await response.text()
      groceryList = JSON.parse(text)
      renderLists()

    })

    if( item.is_purchased ) {
      purchased_li.appendChild(checkbox)
      purchased_li.appendChild(document.createTextNode(item.description))
      purchased_li.appendChild(delete_button)
      shopping_list_purchased_items.appendChild(purchased_li)
    }
    else{
      to_buy_li.appendChild(checkbox)
      to_buy_li.appendChild(document.createTextNode(item.description))
      to_buy_li.appendChild(delete_button)
      shopping_list_to_buy_items.appendChild(to_buy_li)
    }
  }

}

window.onload = async function() { // wait for the page to load
  console.log('PAGE LOADED')

  const button = document.querySelector('button') //find the button
  button.onclick = submit // connects button to submit function

  const statusResponse = await fetch('/auth/status')
  const status = await statusResponse.json()

  if (!status.loggedIn) {
    return // dont try to render lists if not logged in
  }

  // render the lists whenever the page loads
  const response = await fetch('/items')
  groceryList = await response.json()

  renderLists()
}
