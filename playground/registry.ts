/** Shared *metadata*, not component implementation. Copy only the .ts primitive you need. */
export interface ComponentExample {
 id: "sw" | "seg" | "sel" | "menu" | "disc";
 name: string;
 file: string;
 event: string;
 label: string;
 keyboard: string[];
}
export const COMPONENT_EXAMPLES: readonly ComponentExample[] = [
 {id:"sw",name:"Switch",file:"switch.ts",event:"checked-change",label:"Desktop notifications",keyboard:["Tab","Space","Enter"]},
 {id:"seg",name:"Segmented control",file:"segmented-control.ts",event:"value-change",label:"Report cadence",keyboard:["Arrow keys","Home","End"]},
 {id:"sel",name:"Native select",file:"select.ts",event:"value-change",label:"Priority",keyboard:["Native select keys"]},
 {id:"menu",name:"Action menu",file:"dropdown-menu.ts",event:"action",label:"Project actions",keyboard:["Arrow keys","Enter","Escape"]},
 {id:"disc",name:"Disclosure",file:"disclosure.ts",event:"open-change",label:"Advanced settings",keyboard:["Enter","Space"]}
];
