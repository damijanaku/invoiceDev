export const addBusiness = async function (req, res) {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { name, description, address, taxId, registrationNumber, phoneNumber, email, trr } = req.body;

    if (!name || !description || !address || !taxId || !registrationNumber || !phoneNumber || !email || !trr) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const result = await req.db.query(
            `INSERT INTO businesses ("owner_id", name, description, address, tax_id, registration_number, phone_number, email, trr)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING id, name, description, address, tax_id AS "taxId", registration_number AS "registrationNumber", phone_number AS "phoneNumber", email, trr`,
            [userId, name, description, address, taxId, registrationNumber, phoneNumber, email, trr]
        );

        if (!result.rows[0]) {
            return res.status(500).json({ message: 'Failed to add business' });
        }

        return res.status(201).json({
            message: 'Business added successfully',
            business: result.rows[0],
        });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ message: 'Business with these details already exists' });
        }
        if (error.code === '23503') {
            return res.status(400).json({ message: 'Invalid user reference' });
        }
        console.error('addBusiness error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const editBusiness = async function (req, res) {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: 'Business id is required' });
    }

    const { name, description, address, taxId, registrationNumber, phoneNumber, email, trr } = req.body;

    if (!name && !description && !address && !taxId && !registrationNumber && !phoneNumber && !email && !trr) {
        return res.status(400).json({ message: 'No fields to update' });
    }

    const fields = [];
    const values = [];
    let idx = 1;

    if (name)               { fields.push(`name = $${idx++}`);                values.push(name); }
    if (description)        { fields.push(`description = $${idx++}`);         values.push(description); }
    if (address)            { fields.push(`address = $${idx++}`);             values.push(address); }
    if (taxId)              { fields.push(`tax_id = $${idx++}`);              values.push(taxId); }
    if (registrationNumber) { fields.push(`registration_number = $${idx++}`); values.push(registrationNumber); }
    if (phoneNumber)        { fields.push(`phone_number = $${idx++}`);        values.push(phoneNumber); }
    if (email)              { fields.push(`email = $${idx++}`);               values.push(email); }
    if (trr)                { fields.push(`trr = $${idx++}`);                 values.push(trr); }

    // Ownership check built 
    values.push(id);
    values.push(userId);

    try {
        const result = await req.db.query(
            `UPDATE businesses
             SET ${fields.join(', ')}
             WHERE id = $${idx++} AND "owner_id" = $${idx}
             RETURNING id, name, description, address, tax_id AS "taxId", registration_number AS "registrationNumber", phone_number AS "phoneNumber", email, trr`,
            values
        );

        if (!result.rows[0]) {
            return res.status(404).json({ message: 'Business not found' });
        }

        return res.status(200).json({
            message: 'Business updated successfully',
            business: result.rows[0],
        });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ message: 'Business with these details already exists' });
        }
        console.error('editBusiness error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteBusiness = async function (req, res) {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: 'Business id is required' });
    }

    try {
        const result = await req.db.query(
            `DELETE FROM businesses
             WHERE id = $1 AND "owner_id" = $2
             RETURNING id`,
            [id, userId]
        );

        if (!result.rows[0]) {
            return res.status(404).json({ message: 'Business not found' });
        }

        return res.status(200).json({ message: 'Business deleted successfully' });
    } catch (error) {
        if (error.code === '23503') {
            return res.status(409).json({ message: 'Business is referenced by other records' });
        }
        console.error('deleteBusiness error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getBusinesses = async function (req, res) {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const result = await req.db.query(
            `SELECT id, name, description, address,
                    tax_id AS "taxId",
                    registration_number AS "registrationNumber",
                    phone_number AS "phoneNumber",
                    email, trr, created_at AS "createdAt"
             FROM businesses
             WHERE "owner_id" = $1
             ORDER BY created_at DESC`,
            [userId]
        );

        return res.status(200).json({
            count: result.rows.length,
            businesses: result.rows,
        });
    } catch (error) {
        console.error('getBusinesses error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getBusiness = async function (req, res) {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: 'Business id is required' });
    }

    try {
        const result = await req.db.query(
            `SELECT id, name, description, address,
                    tax_id AS "taxId",
                    registration_number AS "registrationNumber",
                    phone_number AS "phoneNumber",
                    email, trr, created_at AS "createdAt"
             FROM businesses
             WHERE id = $1 AND "owner_id" = $2`,
            [id, userId]
        );

        if (!result.rows[0]) {
            return res.status(404).json({ message: 'Business not found' });
        }

        return res.status(200).json({ business: result.rows[0] });
    } catch (error) {
        if (error.code === '22P02') {
            return res.status(400).json({ message: 'Invalid business id' });
        }
        console.error('getBusiness error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};