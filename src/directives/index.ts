import { App } from 'vue';
import tooltipDirective from './tooltip';

// register all directives
const directives = (app: App<Element>) => {
  tooltipDirective(app);
};

export default directives;
