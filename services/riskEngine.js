export const calculateRisk=(content)=>{
    let riskScore=0;
    const lowerContent=content.toLowerCase();
    if(lowerContent.includes("@gmail.com")||lowerContent.includes("@yahoo.com")||lowerContent.includes("@hotmail.com")){
        riskScore+=30;
    }
    if(lowerContent.includes("1 month")||lowerContent.includes("2 weeks")){
        riskScore+=20;
    }
    if(lowerContent.includes("ceo")&& (lowerContent.includes("1 months")|| lowerContent.includes("2 weeks"))){
        riskScore+=25;
    }
     if (lowerContent.includes("hr@")) {
    riskScore += 15;
  }
    let riksLevel="Low";
    if(riskScore>=60){
        riksLevel="High";
    }
    else if(riskScore>=30){
        riksLevel="Medium";
    }
    return {riskScore, riksLevel};
};