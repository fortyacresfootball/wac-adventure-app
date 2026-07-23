// ======================================
// WAC Member State
// Version 2.1
// ======================================

const MemberState = {

    currentMember: null,
    stats: null,
    completed: [],

    async load(memberId) {

        this.currentMember = memberId;

        this.stats =
            await ProgressEngine.getMemberStats(memberId);

        const logs =
            await Database.getLogs();

        this.completed = logs
            .filter(log =>

                log["Member ID"] === memberId &&
                log["Status"] === "Completed"

            )
            .map(log => log["Badge ID"]);

    },

    isCompleted(adventureId) {

        return this.completed.includes(adventureId);

    }

};