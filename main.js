// This function will handle the retrieving of data from API
async function fetchAPI() {
  let response = await fetch(
    'https://data.gov.sg/api/action/datastore_search?resource_id=83c21090-bd19-4b54-ab6b-d999c251edcf'
  )

  // Check if able to retrieve data
  if (response.status === 200) {
    let data = await response.text() // Wait for data to be retrieve, return as the json data
    return data
  } else console.log(response.statusText) // Failure in retrieving data due to response error
}

// This function will parse the json data
// and set to a JSON object for easier
async function jsonParse() {
  let items = await fetchAPI()
  // set the json as an object
  const obj = JSON.parse(items)

  // filter the object to get the data
  var values = obj.result.records
  return values
}

async function renderDiagram(data) {
  var records = await data

  // Set the dimensions of the canvas / graph
  var margin = { top: 10, right: 30, bottom: 20, left: 50 },
    width = 1200 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom

  // Create the SVG element and render to the body of the page
  // with an id tag of #my_dataviz

  var svg = d3
    .select('#my_dataviz')
    // Append the SVG tag and set the attributes based on the dimension
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)

    // Append the a grouping tag to align the canvas to top left
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

  // ----------------
  // Create a tooltip
  // ----------------
  var tooltip = d3
    .select('#my_dataviz')
    .append('div')
    .style('opacity', 0)
    .attr('class', 'tooltip')
    .style('background-color', 'white')
    .style('border', 'solid')
    .style('border-width', '1px')
    .style('border-radius', '5px')
    .style('padding', '10px')

  // Three function that change the tooltip when user hover / move / leave a cell
  var mouseover = function (d) {
    var crime = d.level_2
    var frequency = d.value

    tooltip
      .html('Crime: ' + crime + '<br>' + 'Frequency: ' + frequency)
      .style('opacity', 1)
  }
  var mousemove = function (d) {
    tooltip
      .style('left', d3.mouse(this)[0] + 90 + 'px') // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
      .style('top', d3.mouse(this)[1] + 'px')
  }
  var mouseleave = function (d) {
    tooltip.style('opacity', 0)
  }

  var dropDown = [...new Set(records.map((item) => item.year))]

  // Set the dropdown menu attributes
  d3.select('#selectedYear')
    .selectAll('options')
    .data(dropDown)
    .enter()
    .append('option')
    // .text(d=>d)
    .text(function (d) {
      return d
    })
    // .attr("value", d=>d)
    .attr('value', function (d) {
      return d
    })

  // Set the X and Y axis for the graph => Conver the data from string to Integer
  var yAxisLabel = [...new Array(records.map((item) => parseInt(item.value)))]
  // filter out the categories from the item list
  var xAxisLabel = [...new Set(records.map((item) => item.level_2))]

  // Set the scale of the values of the Y axis
  var x = d3.scaleBand().domain(xAxisLabel).range([0, width])
  var y = d3
    .scaleLinear()
    .domain([d3.min(yAxisLabel[0]), d3.max(yAxisLabel[0])])
    .range([height, 0])

  // Paint the X and Y axis based on the scales
  svg // Add the X axis
    .append('g')
    .attr('transform', 'translate(0,' + height + ')')
    .call(d3.axisBottom(x).tickSizeOuter(0))

  svg // Add the Y axis
    .append('g')
    .call(d3.axisLeft(y))

  // Create responsive u where every change in drop-down will be reflected
  d3.select('#selectedYear').on('change', function (d) {
    const selectedOption = d3.select(this).property('value')

    const filteredData = records.filter(function (d) {
      return d.year === selectedOption
    })

    var u = svg.selectAll('rect').data(filteredData)

    u.enter()
      .append('rect') // Add a new rect for each new elements
      .on('mouseover', mouseover)
      .on('mousemove', mousemove)
      .on('mouseleave', mouseleave)
      .merge(u) // get the already existing elements as well
      .transition() // and apply changes to all of them
      .duration(1000)
      .attr('x', function (d) {
        return x(d.level_2)
      })
      .attr('y', function (d) {
        return y(d.value)
      })
      .attr('width', x.bandwidth())
      .attr('height', function (d) {
        return height - y(d.value)
      })
      .attr('fill', '#69b3a2')
  })

  // Inital Dropdown
  const filteredData = records.filter(function (d) {
    return d.year === '2011'
  })

  var u = svg.selectAll('rect').data(filteredData)

  u.enter()
    .append('rect') // Add a new rect for each new elements
    .on('mouseover', mouseover)
    .on('mousemove', mousemove)
    .on('mouseleave', mouseleave)
    .merge(u) // get the already existing elements as well
    .transition() // and apply changes to all of them
    .duration(1000)
    .attr('x', function (d) {
      return x(d.level_2)
    })
    .attr('y', function (d) {
      return y(d.value)
    })
    .attr('width', x.bandwidth())
    .attr('height', function (d) {
      return height - y(d.value)
    })
    .attr('fill', '#69b3a2')
}

data = jsonParse()
renderDiagram(data)
