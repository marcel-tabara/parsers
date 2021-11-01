async function run() {
  const puppeteer = require('puppeteer')
  const fs = require('fs')
  const { prepareDir } = require('./utils')

  const browser = await puppeteer.launch({ headless: false })
  const page = await browser.newPage()
  const dir = './data'

  await page.goto(
    'https://awscli.amazonaws.com/v2/documentation/api/latest/reference/index.html',
  )

  prepareDir()
  const results = []
  //let i = 0
  const services = await page.$$('.toctree-l1 a')
  console.log('>>> Parsing ...')
  for (const service of services) {
    //if (i < 2) {
    const service_data = await page.evaluate((el) => {
      return {
        service_name: el?.innerText,
        service_url: el?.href,
        service_commands: [],
      }
    }, service)
    results.push(service_data)
    //i++
    //}
  }

  for (const service of results) {
    await page.goto(service.service_url)

    const service_commands = await page.$$('.toctree-l1 a')
    const service_description = await page.evaluate(
      () => document.querySelector('#description')?.innerText,
    )
    service.service_description = service_description
    for (const service_command of service_commands) {
      const command = await page.evaluate((el) => {
        return { command_name: el?.innerText, command_url: el?.href }
      }, service_command)

      service.service_commands.push(command)
    }
  }

  const getCommandOptionsFromSynopsis = (service_command_synopsis) => {
    const arr = service_command_synopsis?.split('\n') ?? []
    return arr.filter((e, i) => i > 1 && i < arr.length - 1)
  }

  for (const service of results) {
    for (const service_command of service.service_commands) {
      await page.goto(service_command.command_url)

      const service_command_description = await page.evaluate(
        () => document.querySelector('#description')?.innerText,
      )
      const service_command_synopsis = await page.evaluate(
        () => document.querySelector('#synopsis')?.innerText,
      )
      const service_command_options_description = await page.evaluate(
        () => document.querySelector('#options')?.innerText,
      )
      const service_command_output = await page.evaluate(
        () => document.querySelector('#output')?.innerText,
      )
      const service_command_examples = await page.evaluate(
        () => document.querySelector('#examples')?.innerText,
      )
      const service_command_options = getCommandOptionsFromSynopsis(
        service_command_synopsis,
      )
      service_command.command_description = service_command_description
      service_command.command_synopsis = service_command_synopsis
      service_command.command_options = service_command_options
      service_command.command_options_description =
        service_command_options_description
      service_command.command_output = service_command_output
      service_command.command_examples = service_command_examples
    }
    const reportPath = `${dir}/${service.service_name}.json`
    if (fs.existsSync(reportPath)) {
      fs.unlinkSync(reportPath)
    }
    fs.appendFileSync(reportPath, JSON.stringify(service, null, 2))
  }

  browser.close()
  console.log('>>> Done')
}

run()
