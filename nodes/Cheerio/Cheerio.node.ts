import * as cheerio from 'cheerio';
import {
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
} from 'n8n-workflow';
  
export class Cheerio implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Cheerio',
    name: 'cheerio',
    icon: 'file:cheerio.svg',
    group: ['transform'],
    version: 1,
    description: 'Parse HTML and run a Cheerio script',
    defaults: {
      name: 'Cheerio',
      color: '#f16521',
    },
    inputs: ['main'],
    outputs: ['main'],
    properties: [
      {
        displayName: 'HTML',
        name: 'html',
        type: 'string',
        default: '',
        placeholder: '<html>…</html>',
        description: 'The raw HTML to parse',
      },
      {
        displayName: 'Script',
        name: 'script',
        type: 'string',
        typeOptions: {
          rows: 8,
        },
        default: `// Example:
// const $ = cheerio.load(html);
// return $('title').text();
const $ = cheerio.load(html);
return { title: $('title').text() };`,
        description:
          'Your JS code. You have `html` (string) & `cheerio` imported—return any JSON-able value.',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      const html = this.getNodeParameter('html', i) as string;
      const script = this.getNodeParameter('script', i) as string;

      // Create a function that will run in the context of our variables
      const scriptFunction = new Function('$', 'cheerio', 'html', `return (async () => { ${script} })()`);
      
      // Run the script with our context
      const result = await scriptFunction(cheerio.load(html), cheerio, html);

      returnData.push({ json: result as any });
    }

    return this.prepareOutputData(returnData);
  }
}
  