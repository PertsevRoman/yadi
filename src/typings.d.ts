/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}

declare function $(selector: any): JQuery;

declare class JQuery {
  treeview(params: any): any;
}
