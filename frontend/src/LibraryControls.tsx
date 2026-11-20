import {useEffect,useRef,useState} from "react";
import {Folder,Layers,Globe2,Link2,Lock,Plus,X,PlaySquare,Bookmark} from "lucide-react";
export type CreateKind="folder"|"collections"|"playlists";
const names={folder:"Новый раздел",collections:"Создать коллекцию",playlists:"Создать плейлист"};
export function CreateDialog({kind,close,save}:{kind:CreateKind;close:()=>void;save:(name:string,description:string,visibility:string)=>string|void}){
 const dialog=useRef<HTMLDialogElement>(null);const [error,setError]=useState("");
 useEffect(()=>{const el=dialog.current;el?.showModal();return()=>el?.close()},[]);
 return <dialog ref={dialog} className="catalog-dialog" aria-labelledby="create-heading" onCancel={close} onClick={e=>{if(e.target===dialog.current)close()}}>
 <form onSubmit={e=>{e.preventDefault();const f=new FormData(e.currentTarget),name=String(f.get("name")).trim();if(!name){setError("Введите название");return}const message=save(name,String(f.get("description")||"").trim(),String(f.get("visibility")||"Приватный"));if(message)setError(message);else close()}}>
 <header><h2 id="create-heading">{names[kind]}</h2><button type="button" onClick={close} aria-label="Закрыть"><X size={18}/></button></header>
 <label>Название<input autoFocus required maxLength={100} name="name" placeholder={kind==="folder"?"Например, Путешествия":"Например, Смотреть на выходных"}/></label>
 {kind!=="folder"&&<><label>Описание <small>необязательно</small><textarea maxLength={1000} name="description" rows={2}/></label><fieldset><legend>Кто может смотреть</legend>{[{value:"Публичный",icon:Globe2},{value:"Доступ по ссылке",icon:Link2},{value:"Приватный",icon:Lock}].map(({value,icon:Icon})=><label className="access-choice" key={value}><Icon size={17}/><span>{value}</span><input type="radio" name="visibility" value={value} defaultChecked={value==="Приватный"}/></label>)}</fieldset></>}
 {error&&<p role="alert">{error}</p>}<footer><button type="button" onClick={close}>Отмена</button><button className="primary">Создать</button></footer></form></dialog>
}
export function EmptyShelf({kind,title,text,action,onClick}:{kind:CreateKind|"saved";title:string;text:string;action:string;onClick:()=>void}){
 const Icon={folder:Folder,collections:Layers,playlists:PlaySquare,saved:Bookmark}[kind];
 return <div className="empty-shelf"><Icon size={30} strokeWidth={1.4}/><h2>{title}</h2><p>{text}</p><button onClick={onClick}>{action}</button></div>
}
export function CreateButton({kind,onClick}:{kind:CreateKind;onClick:()=>void}){return <button className="create-action" onClick={onClick}><Plus size={16}/>{names[kind]}</button>}
