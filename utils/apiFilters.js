class APIFilters {
    constructor(query, queryStr) {
        this.query = query,
            this.queryStr = queryStr
    }

    filter() {
        const queryStrCopy = { ...this.queryStr };

        //Removing fields from the query. Eg. Sort isn't a query, while salary is.
        const removeFields = ['sort'];
        removeFields.forEach(el => delete queryStrCopy[el]);
        //Advance filter using: lt, lte, gt, gte, in
        let queryStr = JSON.stringify(queryStrCopy); //Convert JSON to string
        //Must have a $ infront of expressions for mongoDB. Eg. {"salary":{"$gt":"50000"}}
        queryStr = queryStr.replace(/\b(lt|lte|gt|gte|in)\b/g, match => `$${match}`);

        console.log(queryStr);

        //Convert to JSON with JSON.parse()
        this.query = this.query.find(JSON.parse(queryStr)); //Eg. Job.find({"salary":{"$gt":"50000"}});
        return this;
    }

    sort() {
        if (this.queryStr.sort) {
            //allow multiple values to sort by
            const sortBy = this.queryStr.sort.split(',').join(' ');

            this.query = this.query.sort(sortBy);
        }
        else {
            //if no sort by provided by user, sord by posting date
            this.query = this.query.sort('-postingDate');
        }
        return this;
    }
}

module.exports = APIFilters;