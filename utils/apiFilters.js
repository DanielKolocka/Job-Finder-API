class APIFilters {
    constructor(query, queryStr) {
        this.query = query,
            this.queryStr = queryStr
    }

    filter() {
        const queryStrCopy = { ...this.queryStr };

        //Advance filter using: lt, lte, gt, gte, in
        let queryStr = JSON.stringify(queryStrCopy); //Convert JSON to string
        //Must have a $ infront of expressions for mongoDB. Eg. {"salary":{"$gt":"50000"}}
        queryStr = queryStr.replace(/\b(lt|lte|gt|gte|in)\b/g, match => `$${match}`);

        console.log(queryStr);

        //Convert to JSON with JSON.parse()
        this.query = this.query.find(JSON.parse(queryStr)); //Eg. Job.find({"salary":{"$gt":"50000"}});
        return this;
    }
}

module.exports = APIFilters;