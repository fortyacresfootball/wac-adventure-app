// ======================================
// WAC Recommendation Engine
// Version 1.0
// ======================================

const RecommendationEngine = {

    async getRecommendation(memberId){

        await MemberState.load(memberId);

        const adventures =
            await Database.getAdventures();

        const completed =
            MemberState.completedAdventures || [];

        const recommendation =
            adventures.find(a =>
                !completed.includes(a["ID"])
            );

        return recommendation || null;

    }

};