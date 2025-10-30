import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";

const JogosBarChart = ({ dados }) => {
  // Função para gerar cores baseadas na quantidade de plays
  const getColor = (value) => {
    if (value > 20) return "#FF3333"; // Vermelho para muitos plays
    if (value > 10) return "#FFAA33"; // Laranja para médio
    return "#33CC33"; // Verde para poucos plays
  };

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart
        data={dados}
        margin={{ top: 20, right: 20, left: 10, bottom: 30 }}
        barCategoryGap="30%" // deixa barras mais finas
      >
        <XAxis 
          dataKey="nome" 
          tick={{ fontSize: 12, fill: "#333" }} 
          angle={0} 
          textAnchor="end"
          height={60}
        />
        <YAxis tick={{ fontSize: 12, fill: "#333" }} />
        <Tooltip 
          cursor={{ fill: "rgba(255, 255, 255, 0)" }} 
          formatter={(value) => [`${value} plays`, "Plays"]}
        />
        <Bar dataKey="total" name="Plays">
          {dados.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getColor(entry.total)} />
          ))}
          <LabelList dataKey="total" position="top" fontSize={25} fill="#000" />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export { JogosBarChart };
