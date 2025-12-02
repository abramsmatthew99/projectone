import React from "react";

//Reusable table for whatever pages I'm looking at
const GenericTable = ({columns, data, actions}) => {
    return (
        <div className="card shadow-sm">
            <div className="card-body p-0">
                <table className="table table-striped table-hover mb-0">
                    <thead className="table-dark">
                        <tr> {/*Loop over each value in columns*/}
                            {columns.map((col, index) => (
                                <th key={index}>{col.header}</th>
                            ))}
                            {actions && <th className="text-end">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + (actions ? 1 : 0)} className="text-center p-4">
                                    No data available
                                </td>
                            </tr>
                        ) : (
                            data.map((row, rowIndex) => (
                                <tr key={row.id || rowIndex}>
                                    {columns.map((col, colIndex) => (
                                        <td key={colIndex}>
                                            {/* If 'render' is provided, use it. Otherwise, just show the raw value */}
                                            {col.render ? col.render(row) : row[col.key]}
                                        </td>
                                    ))}
                                    
                                    {actions && (
                                        <td className="text-end">
                                            {actions(row)}
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default GenericTable;