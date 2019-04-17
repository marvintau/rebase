import React from 'react';

export default function Paginator({currPage, totalPage, prevPage, nextPage}){

    currPage = currPage ? currPage : 1;
    totalPage = totalPage ? totalPage : 1;

    return (<div><div className="btn-group">
        <button className="btn btn-outline-info" onClick={(e)=>{prevPage()}}>&laquo;</button>
        <button className="btn btn-outline-info" onClick={(e)=>{nextPage()}}>&raquo;</button>
    </div>
    <span className="page-indicator">第 {currPage} / {totalPage} 页 </span>
    </div>)
}
