export type LessonCompletion={content_id:string;lesson:number};
export function mergeLessonProgress(...lists:unknown[]):LessonCompletion[]{
 const result:LessonCompletion[]=[];
 for(const list of lists){if(!Array.isArray(list))continue;for(const item of list){
  if(!item||typeof item.content_id!=='string'||!Number.isInteger(item.lesson)||item.lesson<0)throw new Error('Invalid lesson progress.');
  if(!result.some(p=>p.content_id===item.content_id&&p.lesson===item.lesson))result.push({content_id:item.content_id,lesson:item.lesson});
 }}return result;
}
